import fs from 'fs';

export const getAllFiles = (dir: string): string[] => {
    const files: string[] = [];
    fs.readdirSync(dir).forEach(file => {
        const filePath = `${dir}/${file}`;
        if (fs.statSync(filePath).isDirectory()) {
            files.push(...getAllFiles(filePath));
        } else {
            files.push(filePath);
        }
    });
    return files;
}