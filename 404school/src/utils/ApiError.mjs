
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


export class FORBIDDEN extends ApiError{
    constructor({event,message="access forbidden!"}){
        super({message,isKnown:true,event,status:403});
    }
}

export class NOTFOUND extends ApiError{
    constructor({event,message="not found!"}){
        super({message,isKnown:true,event,status:404});
    }
}

export class UNAUTHENTICATED extends ApiError{
    constructor({event,message="unAuthorized action!"}){
        super({message,isKnown:true,event,status:401});
    }
}

export class BADREQUEST extends ApiError{
    constructor({event,message="bad action!"}){
        super({message,isKnown:true,event,status:400})
    }
}


export class DUPLICATE extends ApiError{
    constructor({event,message="already exist!"}){
        super({message,isKnown:true,event,status:409})
    }
}


export class RATELIMIT extends ApiError{
    constructor({event,message="rate limit error"}){
        super({message,isKnown:true,event,status:429})
    }
}

export class INTERNAL_SERVER_ERROR extends ApiError{
    constructor({event="unknown",layer="unknown",stack}){
        super({event,layer,stack});
    }
    
}

export default ApiError;