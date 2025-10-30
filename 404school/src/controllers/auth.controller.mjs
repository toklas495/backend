import asyncHandler from "../utils/asyncHandler.mjs";
import AuthModel from "../models/auth.model.mjs";
import UserDb from "../models/user.model.mjs";
import db from "../db/index.mjs";
import { tokenGen,hashify,jwtGen } from "../utils/tokenGen.mjs";



class AuthController{
    constructor(){
        this.authdb = new AuthModel(db);
        this.userdb = new UserDb(db);

        //binding;
        this.login = this.login.bind(this);
        this.refresh = this.refresh.bind(this);
    }

    login = asyncHandler(async(req,reply)=>{
        const {username,email,password} = req.body;
        const payload = {
            ...(username!==undefined&&{username}),
            ...(email!==undefined&&{email}),
        }

        const {id} = await this.userdb.checkCred(payload,password);
        const refresh_token = tokenGen();
        const session_token = tokenGen();

        const hash_refresh_token = hashify(refresh_token);
        const hash_session_token = hashify(session_token);
        const access_token = jwtGen({
            id
        })

        await this.authdb.insertToken(hash_refresh_token,hash_session_token,id);


        return {
            status:'ok',
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