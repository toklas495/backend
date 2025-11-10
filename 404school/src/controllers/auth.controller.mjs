import asyncHandler from "../utils/asyncHandler.mjs";
import AuthModel from "../models/auth.model.mjs";
import UserDb from "../models/user.model.mjs";
import db from "../db/index.mjs";
import { tokenGen,hashify,jwtGen } from "../utils/tokenGen.mjs";
import Cache from "../utils/cache.mjs";
import { NOTFOUND, UNAUTHENTICATED } from "../utils/ApiError.mjs";
import mailer from '../service/emailInstance.mjs';




class AuthController{
    constructor(fastify){
        this.authdb = new AuthModel(db);
        this.userdb = new UserDb(db);
        this.authCache = new Cache(fastify,"auth");

        //binding;
        this.login = this.login.bind(this);
        this.refresh = this.refresh.bind(this);
        this.verifyEmail = this.verifyEmail.bind(this);
        this.two_step_verify = this.two_step_verify.bind(this);
    }

    verifyEmail = asyncHandler(async(req,reply)=>{
        const {token} = req.query;
        const hash_verify_token = hashify(token);
        const cached = await this.authCache.cacheData("USER",hash_verify_token);
        if(!cached) throw new UNAUTHENTICATED({message:"Token not found!",event:"VERIFY_EMAIL"});
        const id = (cached);
        await this.authCache.removeKey("USER",hash_verify_token);
        await this.userdb.update(id,{verified:true});
        return {
            status:"ok",
            message:"please verify email!"
        }
    })

    login = asyncHandler(async(req,reply)=>{
        const {username,email,password} = req.body;
        const payload = {
            ...(username!==undefined&&{username}),
            ...(email!==undefined&&{email}),
        }
        const user = await this.userdb.checkCred(payload,password);
        const otp = tokenGen(4)
        const hash_key = hashify(user.email);
        await this.authCache.set({otp,id:user.id},900,hash_key);
        mailer.send(user.email,"2-step-verify",{__EXPIRE__:"15",__OTP__:otp,__SUPPORT__:"nimesht964@gmail.com"})
        return {
            status:"ok",
            message:"check your email!",
            data:{
                id:user.id,
                username:user.username,
                email:user.email,
                role:user.role,
                created_at:user.created_at
            }
        }
    })

    two_step_verify = asyncHandler(async(req,reply)=>{
        const {otp,email} = req.body;
        const key = hashify(email);
        const cached = await this.authCache.cacheData(key);
        if(!cached || cached?.otp!==otp) throw new NOTFOUND({event:"TWO_STEP_VERIFICATION",message:"opt is invalid!"});
        const {id} = cached;
        await this.authCache.removeKey(key);
        const refresh_token = tokenGen(64);
        const session_token = tokenGen(64);
        const hash_refresh_token = hashify(refresh_token);
        const hash_session_token = hashify(session_token);
        await this.authdb.insertToken(hash_refresh_token,hash_session_token,id);
        const access_token = jwtGen({id});
        return {
            status:"ok",
            data:{
                access_token,refresh_token,session_token
            }
        }
    })

    refresh = asyncHandler(async(req,reply)=>{
        const {refresh_token,session_token} = req.body;
        const hash_refresh_token = hashify(refresh_token);
        const hash_session_token = hashify(session_token);
        const new_refresh_token = tokenGen();
        const hash_new_refresh_token = hashify(new_refresh_token);
        const id = await this.authdb.refreshToken(hash_refresh_token,hash_session_token,hash_new_refresh_token);
        const access_token = jwtGen({id});
        return {
            status:'ok',
            data:{
                access_token,refresh_token:new_refresh_token,session_token
            }
        }
    })
}

export default AuthController;