import UserDb from "../models/user.model.mjs";
import db from "../db/index.mjs";
import asyncHandler from "../utils/asyncHandler.mjs";
import { saveUploadToTemp } from "../middleware/saveUpload.middleware.mjs";
import uploadAndCleanup from "../utils/cloudupstream.mjs";
import ApiError from "../utils/ApiError.mjs";



class UserController {
    constructor(){
        this.userdb = new UserDb(db);

        //binding;
        this.register = this.register.bind(this);
        this.update = this.update.bind(this);
        this.read = this.read.bind(this);
        this.destroy = this.destroy.bind(this);
        this.search = this.search.bind(this);
    }

    register = asyncHandler(async (req,reply)=>{
        const {username,email,password,full_name,role} = req.body;
        const payload = {
            username:username.toLowerCase(),
            email:email.toLowerCase(),
            password,
            full_name:full_name.toUpperCase(),
            role:role!=="admin"?role:"student"
        }
        await this.userdb.createUser(email,payload);
        return reply.status(201).send({
            status:"ok"
        })
    }) 

    update = asyncHandler(async(req,reply)=>{
        const {id:userId} = req.user;
        const parts = req.parts();
        const field = {};

        for await (let part of parts){
            if(part.file){
                if(part.fieldname==="profile"){
                    const local_path = await saveUploadToTemp(part);
                    const profile_path = await uploadAndCleanup(local_path);
                    field[part.fieldname] = profile_path;
                }
            }else if(part.fieldname==="username"){
                    field[part.fieldname] = part.value;
            }else if(part.fieldname==="full_name"){
                field[part.fieldname] = part.value;
            }
        }

        const payload = {
            ...(field["username"]!==undefined&&{username:field["username"].toLowerCase()}),
            ...(field["full_name"]!==undefined&&{full_name:field["full_name"].toUpperCase()}),
            ...(field["profile"]!==undefined&&{profile_url:field["profile"]})
        }

        const length = Object.keys(payload).length;
        if(length>3 || length<1){
            throw new ApiError({message:"invalid params!",status:400,isKnown:true,event:"UPDATE"})
        }

        await this.userdb.update(userId,payload);


        return {
            status:"ok"
        }
    })

    read = asyncHandler(async(req,reply)=>{
        const {id:userId} = req.user;
        const user = await this.userdb.read(userId);
        return {
            status:"ok",
            data:user
        }
    })

    destroy = asyncHandler(async(req,reply)=>{
        const {id:userId} = req.user;
        await this.userdb.destroy(userId);
        return {
            status:"ok"
        }
    })

    search = asyncHandler(async(req,reply)=>{
        const {query,limit,page} = req.query;
        const users = await this.userdb.search(query,limit,page);
        return {
            status:"ok",
            data:users
        }
    })
}

export default UserController;
