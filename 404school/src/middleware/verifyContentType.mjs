

export default function verifyContentType(req,res,next){
    if(["GET","DELETE","HEAD"].includes(req.method)) return next();
    const contentType = req.headers["content-type"]||"";

    const allowed = ["application/json","multipart/form-data"];
    if (!allowed.some(t=>contentType.includes(t))) {
        return res.status(415).send({
            success:false,
            message:"Invalid Content-Type. Use application/json",
            code:"UNSUPPORT_MEDIA_TYPE",
            status:415
        })    
    }
    next();
}