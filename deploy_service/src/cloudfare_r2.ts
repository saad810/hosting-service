import { config } from "dotenv";
import { S3 } from "aws-sdk";
import fs, { readFileSync } from "fs";
import path from "path";
import { getAllFiles } from "./file";
config();

const Id = process.env.R2_ACCESS_KEY || "";
const Secret = process.env.R2_SECRET_KEY || "";
const R2_URL = process.env.R2_URL || "";

const BucketName = "hosting-service";
const s3 = new S3({
    accessKeyId: Id,
    secretAccessKey: Secret,
    endpoint: R2_URL,
})
export const uploadFile = async (filename: string, localFilePath: string) => {
    // console.log(`Uploading ${filename} \t with ${localFilePath} to Cloudflare R2`);

    const fileContent = readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: BucketName,
        Key: filename,
    }).promise();
    // console.log(response);
}
export const uploadDistFolder = async (id: string) => {
    const folderPath = path.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath)
    allFiles.forEach(async (filePath) => {
       
        await uploadFile(`dist/${id}/`+ filePath.slice(folderPath.length + 1), filePath);
    });
    await new Promise((resolve) => setTimeout(resolve, 5000));
}
export const downloadS3Folder = async (dir: string) => {
    if (fs.existsSync(dir)) {
        console.log(`Directory ${dir} already exists, skipping download.`);
        return;
    }
    console.log(`Downloading files from S3 to ${dir}`);
    const allFiles = await s3.listObjectsV2({
        Bucket: BucketName,
        Prefix: dir
    }).promise();
    if (!allFiles?.Contents || allFiles?.Contents?.length === 0) {
        console.log("No files found in S3 bucket.");
        return;
    }
    // console.log(allFiles?.Contents)

    console.log(`Found ${allFiles?.Contents?.length} files in S3`);
    const allPromises = allFiles.Contents?.map(async ({ Key }) => {
        return new Promise(async (resolve) => {
            if (!Key) {
                resolve("");
                return;
            }
            const finalOutputPath = path.join(__dirname, Key);
            const outputFile = fs.createWriteStream(finalOutputPath);
            const dirName = path.dirname(finalOutputPath);
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName, { recursive: true });
            }
            s3.getObject({
                Bucket: BucketName,
                Key
            }).createReadStream().pipe(outputFile).on("finish", () => {
                resolve("");
            })
        })
    }) || []
    console.log("awaiting");

    await Promise.all(allPromises?.filter(x => x !== undefined));
}