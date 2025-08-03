import {config} from "dotenv";
import { S3 } from "aws-sdk";
import { readFileSync } from "fs";
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
    

export const uploadFile = async (filename: string, localFilePath: string)=>{
    console.log(`Uploading ${filename} \t with ${localFilePath} to Cloudflare R2`);

    const fileContent = readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: BucketName,
        Key: filename,
    }).promise();
    console.log(response);
}