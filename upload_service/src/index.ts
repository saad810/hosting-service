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
import Redis from "ioredis"

config();

// create express app
const app = express();
app.use(cors());
app.use(express.json());
console.log(process.env.REDIS_URL ? "Redis URL is set" : "Redis URL is not set");
const publisher = new Redis(process.env.REDIS_URL || "");
const subcriber = new Redis(process.env.REDIS_URL || "");


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
        const new_local_path = normalizePath(file);
        // console.log(`normalized path: ${new_path}`);
        // console.log(file.slice(__dirname.length + 1));
        const new_path = normalizePath(file.slice(__dirname.length + 1));
        console.log(`Uploading ${new_local_path} to ${new_path}`);
        // console.log(`Uploading ${file.slice(__dirname.length + 1)}`);
        
        await uploadFile(new_path, new_local_path);

    });

    await new Promise((resolve) => setTimeout(resolve, 5000));

    publisher.lpush("builder_queue", id)
    publisher.hset("status", id, "uploaded");

    res.json({
        id: id,
        message: "success",
    })
})


app.get("/status",async (req, res) => {
    const id = req.query.id as string;
    const status = await subcriber.hget("status", id as string);
    res.json({
        id: id,
        status: status
    });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
