import {default as dotenv} from 'dotenv';

dotenv.config({quiet:true})


const env_constant = {
    host:process.env.HOST||"0.0.0.0",
    port:process.env.PORT||3000,
    NODE_ENV:process.env.NODE_ENV||"development",
    db:{
        name:process.env.DB_NAME||"404",
        pass:process.env.DB_PASS||"postgres",
        user:process.env.DB_USER||"postgres",
        port:process.env.DB_PORT||5432,
        host:process.env.DB_HOST||"0.0.0.0"
    },
    cloudinary:{
        name:process.env.CLOUDINARY_NAME,
        api_key:process.env.CLOUDINARY_KEY,
        api_secret:process.env.CLOUDINARY_SECRET
    },
    jwt:{
        secret:process.env.JWT_SECRET,
        issuer:"404"
    }
}

export default env_constant;