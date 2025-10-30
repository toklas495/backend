import ApiError from "./ApiError.mjs";

export default async function errorHandler(error,req,reply){

    if(error.validation){
        const code = "BAD_REQ";
        const details = [];
        const params = [];
        for(let valid of error.validation){
            params.push(valid.params);
            details.push(valid.message);
        }
        return reply.status(400).send({
            success:false,event:"VALIDATION",code,details,params
        })
    }   

    const isInstance = error instanceof ApiError;
    if(isInstance && error.isKnown){
        const {message,status,event,code} = error;
        return reply.status(status).send({
            success:false,message,event,code
        })
    }

    const layer = isInstance?error.layer:"ERROR_LAYER";
    const event = isInstance?error.event:"ERROR_EVENT";
    const stack = isInstance?error.stack:error.stack;
    
    console.log({
        layer,event,stack
    })
    return reply.status(500).send({
        success:false,
        code:"INTERNAL_SERVER_ERROR",
        message:"something went wrong!"
    })
}