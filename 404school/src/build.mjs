import {default as Fastify} from 'fastify';
import {default  as cookie} from '@fastify/cookie';
import {default as multipart} from '@fastify/multipart';
import {default as router} from './routes/index.mjs';
import {default as verifyContentType } from './middleware/verifyContentType.mjs';
import {authMiddleware} from './middleware/checkAuth.middleware.mjs';
import errorHandler from './utils/errorHandler.mjs';
import mailer from './service/emailInstance.mjs';
import env_constant from '../env.config.mjs';
import redisPlugin from './utils/plugin/redisPlugin.mjs';

const fastify = Fastify({
    logger:true
});

fastify.register(redisPlugin);
fastify.register(cookie);
fastify.register(multipart);
fastify.addHook("onRequest",verifyContentType);
fastify.addHook("onRequest",authMiddleware);
// routes

fastify.register(router,{prefix:"/api/v1"});



//handler
fastify.setErrorHandler(errorHandler);

fastify.ready(async()=>{
    const namespace = "404school";
    try{
        const versions = ["auth"];
        for(let version of versions){
            const key = `${namespace}:${version}:version`;
            const value = await fastify.redis.get(key);
            if(!value){
                await fastify.redis.set(key,"1");
            }
        }
        console.log(`version setup: ${versions}`);
        // await mailer.send(env_constant.gmail.user,"test");
        setInterval(async ()=>{
            try{
                await mailer.flushQueue();
            }catch(error){
                console.error(`FLUSH_ERROR: ${error}`);
            }
        },1000*60)
    }catch(error){
        process.exit(1);
    }
})

export default fastify;