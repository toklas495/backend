import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env_constant from '../../env.config.mjs';

const jwtGen = (payload,expires_in="15m")=>{
    const secret_key = env_constant.jwt.secret;
    return jwt.sign(
        payload,
        secret_key,
        {
            issuer:env_constant.jwt.issuer,
            subject:payload.id,
            jwtid:crypto.randomBytes(8).toString("hex"),
            expiresIn:expires_in
        }
    )
}

const tokenGen = (bytes=64)=>{
    return crypto.randomBytes(bytes).toString("hex");
}

const hashify = (token)=>{
    return crypto.createHash("sha256").update(token).digest().toString("hex");
}

export {jwtGen,tokenGen,hashify};