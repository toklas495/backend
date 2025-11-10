import nodemailer from 'nodemailer';
import env_constant from '../../env.config.mjs';



const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:env_constant.gmail.user,
        pass:env_constant.gmail.pass
    }
});

async function sendEmail(option){
    try{
        return await transporter.sendMail(option)
    }catch(error){
        throw error;
    }
}

export default sendEmail;