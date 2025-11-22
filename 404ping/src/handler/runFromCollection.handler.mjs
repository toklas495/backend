import { readRequestFile } from "../utils/fileHandle.mjs";
import RequestHandler from "./request.handler.mjs";
import http from 'http';

export default async function runFromCollectionHandler(argv){
    const [collection,reqName] = argv.collection_request.split(":").map(v=>v.trim());
    try{
        const request = await readRequestFile(collection,reqName);
        argv = {...argv,...request};
        await RequestHandler(http,argv);
    }catch(error){
        throw error;
    }
}