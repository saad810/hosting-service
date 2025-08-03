import express from "express";
import cors from "cors";
import { simpleGit } from "simple-git";
import { generateRandomId } from "./utils";
import path from "path";
import { getAllFiles } from "./fite";
import { config } from "dotenv";
import { uploadFile } from "./cloudfare_r2";
import { createClient } from "redis";
// createClient

config();

// create express app
const app = express();
app.use(cors());
app.use(express.json());

// redis client
const publisher = createClient();
publisher.connect();


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
        // console.log(`Uploading ${file.slice(__dirname.length + 1)}`);
        await uploadFile(file.slice(__dirname.length + 1), file);
    });

    publisher.lPush("build-queue", id);

    res.json({
        id: id,  
        message: "success",
    })
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});