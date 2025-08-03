import express from "express";
import cors from "cors";
import { simpleGit } from "simple-git";
import { generateRandomId, normalizePath } from "./utils";
import path from "path";
import { getAllFiles } from "./fite";
import { config } from "dotenv";
import { uploadFile } from "./cloudfare_r2";
import mongoose from "mongoose";
import BuilderQueue from "./models/builder_queue";


config();

// create express app
const app = express();
app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
    const repoURL = req.body.repoURL;
    const id = generateRandomId();
    const dir = path.join(__dirname, `./output/${id}`);
    await simpleGit().clone(repoURL, dir);
    const files = getAllFiles(dir);
    // console.log(files);
    // upload to Cloudflare R2

    files.forEach(async (file) => {
        // if their is .git directory ignore it

        if (file.includes(".git")) {
            return;
        }
        // normalize the path
        const new_path = normalizePath(file);
        console.log(`normalized path: ${new_path}`);
        // console.log(`Uploading ${file.slice(__dirname.length + 1)}`);
        await uploadFile(file.slice(__dirname.length + 1), new_path);
    });
    const job = await BuilderQueue.create({
      id: id,
      status: "pending",
    });
//   const job = await Job.create({ type, payload });

    res.json({
        id: id,
        message: "success",
        job: job?.status
    })
})
// connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "").then(() => {
    console.log("Connected to MongoDB");
    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });

});
