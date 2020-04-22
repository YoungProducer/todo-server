import fs from 'fs';
import path from 'path';

const relativePath = (filePath: string) => {
    return path.join(__dirname, `../../${filePath}`);
};

export const writeFile = (file: any) =>
    new Promise((resolve, reject) => {
        const writePath = relativePath(`uploads/${file.name}`);

        const ws = fs.createWriteStream(writePath, {
            flags: 'w',
        });

        ws.write(file.data, (err) => {
            if (err) reject(err);
        });
        ws.end();

        ws.on('close', () => resolve('Success'));
    });
