import express from "express";
import { config } from "dotenv";
import { S3 } from "aws-sdk";
import mime from "mime-types";
import chalk from "chalk";

config();
const log = console.log;

const Id = process.env.R2_ACCESS_KEY || "";
const Secret = process.env.R2_SECRET_KEY || "";
const R2_URL = process.env.R2_URL || "";

const BucketName = "hosting-service";

const s3 = new S3({
    accessKeyId: Id,
    secretAccessKey: Secret,
    endpoint: R2_URL,
});

const app = express();

app.get("/*", async (req, res) => {
    const start = process.hrtime.bigint(); // ⏱ start timing
    try {
        const host = req.hostname;
        const id = host.split(".")[0];
        const filepath = req.path;
        const key = `dist/${id}${filepath}`;

        log(chalk.magenta.bold("\n📡 Incoming request"));
        log(chalk.cyan(" ├─ Host: ") + chalk.white.bold(host));
        log(chalk.cyan(" ├─ ID:   ") + chalk.green.bold(id));
        log(chalk.cyan(" ├─ Path: ") + chalk.green.bold(filepath));
        log(chalk.cyan(" └─ Key:  ") + chalk.yellow.bold(key));

        const contents = await s3
            .getObject({
                Bucket: BucketName,
                Key: key,
            })
            .promise();

        const type = mime.lookup(filepath) || "application/octet-stream";
        log(chalk.blue("📦 Content-Type: ") + chalk.green.bold(type));

        if (/\.[0-9a-f]{8}\./.test(filepath)) {
            log(chalk.gray("🗂 Cache: long-term (immutable)"));
            res.set("Cache-Control", "public, max-age=31536000, immutable");
        } else if (filepath.endsWith(".html")) {
            log(chalk.gray("🗂 Cache: no-cache (HTML)"));
            res.set("Cache-Control", "no-cache");
        } else {
            log(chalk.gray("🗂 Cache: short-term (1h)"));
            res.set("Cache-Control", "public, max-age=3600");
        }

        res.set("Content-Type", type);
        res.send(contents.Body);

        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1e6; // convert to ms
        log(chalk.green.bold(`✅ Response sent successfully in ${duration.toFixed(2)} ms\n`));
    } catch (err) {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1e6;

        log(chalk.red.bold("❌ Error fetching file: ") + err);
        log(chalk.red(`⏱ Duration: ${duration.toFixed(2)} ms\n`));

        res.status(404).send("File not found");
    }
});

app.listen(3001, () => {
    log(chalk.yellow.bold("\n🚀 Server running at http://localhost:3001\n"));
});
