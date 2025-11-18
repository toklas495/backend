import UserDb from "../models/user.model.mjs";
import Student from '../models/student.model.mjs';
import db from "../db/index.mjs";
import asyncHandler from "../utils/asyncHandler.mjs";
import { saveUploadToTemp } from "../middleware/saveUpload.middleware.mjs";
import uploadAndCleanup from "../utils/cloudupstream.mjs";
import ApiError, { DUPLICATE, NOTFOUND } from "../utils/ApiError.mjs";
import mailer from "../service/emailInstance.mjs";
import { tokenGen,hashify } from "../utils/tokenGen.mjs";
import env_constant from "../../env.config.mjs";
import Cache from "../utils/cache.mjs";


class UserController {
    constructor(fastify){
        this.userdb = new UserDb(db);
        this.studentdb = new Student(db);
        this.authCache = new Cache(fastify,"auth");
        //binding;
        this.register = this.register.bind(this);
        this.update = this.update.bind(this);
        this.read = this.read.bind(this);
        this.destroy = this.destroy.bind(this);
        this.search = this.search.bind(this);
        this.getStudentCourse = this.getStudentCourse.bind(this);
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
        const isUserExist = await this.userdb.isEmail(email);
        if(isUserExist) throw new DUPLICATE({event:"REGISTER",message:"Already Exist!"});
        const user = await this.userdb.createUser(payload);
        const verify_token = tokenGen(32);
        const hashify_verify_token = hashify(verify_token);
        const verify_url = `${env_constant.VERIFY_EMAIL_URL}?token=${verify_token}`;
        await this.authCache.set(user.id,900,"USER",hashify_verify_token);
        mailer.send(email,"verify-email",{"__LINK__":verify_url,"__SUPPORT__":"nimesht964@gmail.com","__EXPIRE__":"15 min"})
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

        const user = await this.userdb.update(userId,payload);
        if(!user) throw new NOTFOUND({event:"UPDATE",message:"user not found!"});
        return {
            status:"ok"
        }
    })

    read = asyncHandler(async(req,reply)=>{
        const {id:userId} = req.user;
        const user = await this.userdb.read(userId);
        if(!user) throw new NOTFOUND({event:"READ",message:"user not found!"});
        return {
            status:"ok",
            data:user
        }
    })

    destroy = asyncHandler(async(req,reply)=>{
        const {id:userId} = req.user;
        const user = await this.userdb.destroy(userId);
        if(!user) throw new NOTFOUND({event:"DESTROY",message:"user not found!"});
        return {
            status:"ok"
        }
    })

    search = asyncHandler(async(req,reply)=>{
        const {query,limit,page} = req.query;
        const offset = (page-1)*limit;
        const users = await this.userdb.search(query,limit,offset);
        return {
            status:"ok",
            data:users
        }
    })


    getStudentCourse = asyncHandler(async(req,reply)=>{
        const {id:user_id} = req.user||{};
        const student_course = await this.studentdb.getStudentCourse(user_id);
        return {
            status:"ok",
            data:student_course
        }
    })
}

export default UserController;
