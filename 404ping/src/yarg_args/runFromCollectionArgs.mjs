// import runFromCollectionHandler from "../handler/runFromCollection.handler.mjs";

import CliError from "../utils/Error.mjs"


const runFromCollectionYargs = (yargs)=>{
    return yargs.usage("Usage: 404ping run <option>").positional("collection_request",{
        describe:"Format:  collection:request",
        type:"string"
    }).check((argv)=>{
        if(
            !argv.collection_request||
            typeof(argv.collection_request)!=="string"||
            !argv.collection_request.includes(":")
        ) throw new CliError({isKnown:true,message:"Invalid <collection_request>",type:"warn"});

        const [key,value] = argv.collection_request.split(":").map(v=>v.trim());
        if(!key||!value) throw new CliError({isKnown:true,message:"Invalid \"collection:request\". format: <collection_name:request_name>"})
        return true;
    })
}

export default runFromCollectionYargs;