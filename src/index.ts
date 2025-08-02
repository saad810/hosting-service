import express from "express";
import cors from "cors";
import SimpleGit, { simpleGit } from "simple-git";
import { generateRandomId } from "./utils";


const app = express();
app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
    const repoURL = req.body.repoURL;
    console.log(`Deploying from repository: ${repoURL}`);

    const id = generateRandomId();
    await simpleGit().clone(repoURL, `./output/${id}`);

    res.json({
        message: `Deployment initiated from ${repoURL}`,
        status: "success"
    })
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});