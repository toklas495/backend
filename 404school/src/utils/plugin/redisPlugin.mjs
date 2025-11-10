import Redis from 'ioredis';
import fp from 'fastify-plugin';
import env_constant from '../../../env.config.mjs';

export default fp(async(fastify,options)=>{
    const option = {
        host:env_constant.REDIS.redis_server.host,
        port:env_constant.REDIS.redis_server.port,
        password:env_constant.REDIS.redis_server.pass,
        keyPrefix:options.keyPrefix||""
    }

    const redis = new Redis(option);

    redis.on("error",(err)=>{
        console.error(`REDIS ERROR : ${err}`);
        process.exit(1);
    })

    fastify.decorate("redis",redis); 
})