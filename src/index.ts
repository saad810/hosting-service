import express from "express";
import cors from "cors";
import { simpleGit } from "simple-git";
import { generateRandomId } from "./utils";
import path from "path";
import { getAllFiles } from "./fite";
import {config} from "dotenv";

config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
    const repoURL = req.body.repoURL;
    const id = generateRandomId();
    const dir = path.join(__dirname, `./output/${id}`);
    await simpleGit().clone(repoURL, dir);
    const files = getAllFiles(dir);

    res.json({
        id: id,
        message: "success",
        files: files
    })
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});