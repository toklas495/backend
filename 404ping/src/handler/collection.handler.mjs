import CliError from "../utils/Error.mjs";
import { createCollection,saveRequestInCollection } from "../utils/fileHandle.mjs";
import RequestHandler from "./request.handler.mjs";

export default async function collectionHandler(http,argv){
    let {action,name,request,data,header,method} = argv;
    const url = argv._[1];


    // create collection
    // if(action==="create")
    try{
        switch(action){
            case "create":
                if(!name||!/^[a-zA-Z0-9_\-]+$/.test(name)) throw new CliError({isKnown:true,message:"Provide Collection name! must not contain invalid chars",type:"warn"});
                await createCollection(name);
                break;
            case "save":
                argv["url"] = url||undefined;
                if(![name,request].every(value=>(value&&/^[a-zA-Z0-9_\-]+$/.test(value)))){
                    throw new CliError({isKnown:true,message:"Provide Collection <collection_name>|<request_name>! must not contain invalid chars",type:"warn"})
                }
                const response = await RequestHandler(http,argv);
                const request_body = {
                    url:response.request.url,
                    method:response.request.method,
                    headers:response.request.headers,
                    data:response.request.data
                }
                await saveRequestInCollection(name,request,request_body)
                break;
            default:
        }
    }catch(error){
        throw error;
    }
}