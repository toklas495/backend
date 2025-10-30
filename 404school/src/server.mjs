import fastify from "./build.mjs";
import env_constant from "../env.config.mjs";
import { closeDb } from "./db/index.mjs";
import util from 'util';

const PORT = env_constant.port;
const HOST = env_constant.host;



const start = async()=>{
    try{
        await fastify.listen({port:PORT,host:HOST});
        console.log(`Server listening at ${HOST}:${PORT}`);
    }catch(error){
        switch(error.code){
            case "EADDRINUSE":
                console.log("Another process is already listening on that port");
                break;
            case "EACCES":
                console.log("You tried to bind to a privileged port (<1024) without admin rights");
                break;
            case "EPERM":
                console.log("Usually a file/permission issue (e.g., logs or sockets require admin access)");
                break;
            case "EADDRNOTAVAIL":
                console.log("Address not available");
                break;
            case "ETIMEDOUT":
                console.log("Connection timed out");
                break;
            case "ECONNREFUSED":
                console.log("Connection refused");
                break;
            default:
                console.log("SERVER FAILED: ",error);
        }
        process.exit(1);
    }
}

const shutdown = async (signal)=>{
    try{
        console.log(`SERVER RECEIVEING A SHUTDOWN SIGNAL - ${signal}`);
        await closeDb();
        await fastify.close();
        console.log(`SERVER SUCCESSFULLY CLOSED!`);
        process.exit(0);
    }catch(error){
        console.log(`SHUTDOWN FAILED error: ${error}`);
        process.exit(1);
    }
}

start();

process.on("SIGHUP",async ()=>{await shutdown("SIGHUP")});
process.on("SIGINT",async()=>{await shutdown("SIGINT")});
process.on("SIGTERM",async ()=>{await shutdown("SIGTERM")});
process.on("SIGQUIT",async ()=>{await shutdown("SIGQUIT")});


process.on("uncaughtException",(error)=>{
    console.log(`UNCAUGHT_EXCEPTION: ${error}`);
    process.exit(1);
})

process.on("unhandledRejection",(error,rejection)=>{
    console.log(`UNHANDLE_REJECTION: ${util.inspect(rejection)}`);
    console.log(`ERROR: ${util.inspect(error)}`);
})

process.on("exit",(code)=>{
    console.log(`bye bye....     CODE-${code}`);
})

process.on("warning",(warning)=>{
    console.log(`WARNING: ${warning}`);
})


