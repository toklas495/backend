import fs, { write } from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import __dirname from '../../approotdir.mjs';

const pump = promisify(pipeline);


export async function saveUploadToTemp(part) {
    const uploadDir = path.join(__dirname, "public", "temp");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filename = Date.now() + '-' + part.filename;
    const destPath = path.join(uploadDir, filename);
    const writeStream = fs.createWriteStream(destPath);
    
    try{
        await pump(part.file,writeStream);
        return destPath;    
    }catch(err){
        try{writeStream.destroy();}catch(_){};
        if(fs.existsSync(destPath)) fs.unlinkSync(destPath);
        throw err;
    }
}
