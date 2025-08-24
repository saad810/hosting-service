import Redis, { Command } from 'ioredis'
import { config } from "dotenv";
import { downloadS3Folder, uploadDistFolder } from './cloudfare_r2';
import { buildProject } from './utils';


config();

console.log(process.env.REDIS_URL ? "Redis URL is set" : "Redis URL is not set");
const subscriber = new Redis(process.env.REDIS_URL || '');
const publisher = new Redis(process.env.REDIS_URL || '');

async function main() {
    while (1) {
        const res = await subscriber.brpop(
            "builder_queue", 0
        );

        // @ts-ignore
        const id = res[1];
        // console.log(`Processing id: ${id}`);
        const dir = `output/${id}`;
        console.log("begin download s3 folder")
        await downloadS3Folder(dir);
        console.log("building project")
        await buildProject(id);
        console.log("uploading dist")
        await uploadDistFolder(id);
        console.log("finished processing id:", id);
        publisher.hset("status", id, "deployed");
        ;
    }
}

main().catch((err) => {
    console.error("Error in main:", err);
});