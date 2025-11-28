import jwt from 'jsonwebtoken';
import env_constant from '../../env.config.mjs';
import ApiError from '../utils/ApiError.mjs';

export  async function authMiddleware(req,reply){
        const authorization_header = req.headers["authorization"];
        console.log(authorization_header)
        if(!authorization_header) return;
        const header_parts = authorization_header.trim().split(" ");
        try{
            if(header_parts[0]!=="Bearer" || header_parts[1]=="") throw new ApiError({message:"Inavalid token!",status:401,event:"AUTH",isKnown:true})
        // secret
            const token = header_parts[1];
            const secret = env_constant.jwt.secret;
            const payload = await jwt.verify(token,secret,{algorithm:"SHA256"});
            if(payload){
                req.user = payload;
            }    
        }catch(error){
            let message = undefined;
            if(error instanceof jwt.JsonWebTokenError){
                message = "jwt signature is required!";
            }else if(error instanceof jwt.TokenExpiredError){
                message = "jwt expired!"
            }else if(error instanceof jwt.NotBeforeError){
                message = "not before!";
            }
            if(error instanceof ApiError){
                throw error;
            }
            throw  message!==undefined? new ApiError({message,event:"AUTH",isKnown:true,status:401}):error;
        }
}

export async function checkAuth(req,reply){
    if(req.user && Object.keys(req.user).length){
        return;
    }
    throw new ApiError({message:"Auth is required!",event:"AUTH",status:403,isKnown:true})
}