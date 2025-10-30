import fs from 'fs';
import cloudinary from './cloudinary.mjs';
import { unlink } from 'fs/promises';

function uploadStreamToCloudinary(localFilePath,folder="user_profile"){
    return new Promise((resolve,reject)=>{
        const uploadStream = cloudinary.uploader.upload_stream(
            {folder,resource_type:'auto'},
            (err,result)=>{
                if(err)return reject(err);
                resolve(result);
            }
        )
        const read = fs.createReadStream(localFilePath);
        // pipe read -> cloudinary upload stream
        read.pipe(uploadStream).on("error",reject);

    })
}

async function uploadAndCleanup(localFilePath){
    const result = await uploadStreamToCloudinary(localFilePath,"user_profiles");
    await unlink(localFilePath) //delete local file
    return result.secure_url;
}

export default uploadAndCleanup;

