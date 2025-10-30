
const ERROR_CODE={
    500:"INTERNAL_SERVER_ERROR",
    400:"BAD_REQUEST",
    401:"UNAUTHENTICATED",
    404:"NOT_FOUND",
    403:"FORBIDDEN",
    200:"SUCCESS",
    201:"CREATED",
    204:"NO_CONTENT",
    429:"RATE_LIMIT",
    409:"DUPLICATE"
}


class ApiError extends Error{
    constructor({message,event,layer,isKnown=false,status=500,stack}){
        super(message);
        this.message = message;
        this.event = event;
        this.layer = layer;
        this.isKnown = isKnown;
        this.code = ERROR_CODE[status];
        this.status = status;
        if(stack){
            this.stack = stack;
        }else{
            this.stack = Error.captureStackTrace(this,this.constructor);
        }
    }
}

export default ApiError;