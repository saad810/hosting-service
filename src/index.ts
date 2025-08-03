import express from "express";
import cors from "cors";
import { simpleGit } from "simple-git";
import { generateRandomId } from "./utils";
import path from "path";
import { getAllFiles } from "./fite";
import { config } from "dotenv";
import { uploadFile } from "./cloudfare_r2";

config();

const app = express();
app.use(cors());
app.use(express.json());

console.log(__dirname);

app.post("/deploy", async (req, res) => {
    const repoURL = req.body.repoURL;
    const id = generateRandomId();
    const dir = path.join(__dirname, `./output/${id}`);
    await simpleGit().clone(repoURL, dir);
    const files = getAllFiles(dir);
    console.log(files);
    // upload to Cloudflare R2

    files.forEach(async (file) => {
        // if their is .git directory ignore it

        if (file.includes(".git")) {
            return;
        }
        console.log(`Uploading ${file.slice(__dirname.length + 1)}`);
        await uploadFile(file.slice(__dirname.length + 1), file);
    });


    res.json({
        id: id,
        message: "success",
        files: files
    })
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});