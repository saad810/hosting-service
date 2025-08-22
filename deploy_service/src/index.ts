import Redis, { Command } from 'ioredis'
import { config } from "dotenv";
import { downloadS3Folder } from './cloudfare_r2';


config();

console.log(process.env.REDIS_URL ? "Redis URL is set" : "Redis URL is not set");
const subscriber = new Redis(process.env.REDIS_URL || '');

async function main() {
    while(1){
        const res = await subscriber.brpop(
            "builder_queue",0
        );
      
        // @ts-ignore
        const id = res[1];
        // console.log(`Processing id: ${id}`);
        const dir = `output/${id}`;
        await downloadS3Folder(dir);
    }
}

main().catch((err) => {
    console.error("Error in main:", err);
});