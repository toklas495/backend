import {default as Fastify} from 'fastify';
import {default  as cookie} from '@fastify/cookie';
import {default as multipart} from '@fastify/multipart';
import {default as router} from './routes/index.mjs';
import {default as verifyContentType } from './middleware/verifyContentType.mjs';
import {default as rateLimit} from '@fastify/rate-limit';
import {authMiddleware} from './middleware/checkAuth.middleware.mjs';
import errorHandler from './utils/errorHandler.mjs';
import mailer from './service/emailInstance.mjs';
import redisPlugin from './utils/plugin/redisPlugin.mjs';
import {default as cors} from '@fastify/cors';
import ApiError from './utils/ApiError.mjs';
import swagger from '@fastify/swagger';
import swagger_ui from '@fastify/swagger-ui';

const fastify = Fastify({
    logger:true
});

fastify.register(cors,{
    origin:["http://127.0.0.1:5500"],
    allowedHeaders:["content-type","authorization"],
    exposedHeaders:[],
    credentials:true,
    methods:["GET","POST","PATCH","PUT","DELETE"]
})

fastify.register(rateLimit,{
    max:100,
    timeWindow:'15 minutes',
    cache:10000,
    allowList:['127.0.0.1'],
    redis:null,
    skipOnError:false,

    errorResponseBuilder:(request,context)=>{
        return new ApiError({status:429,message:`Rate limit exceeded. Try again in ${Math.ceil(context.ttl / 1000)} seconds.`,event:"RATE_LIMIT",isKnown:true})
    },
    addHeaders:{
        'x-ratelimit-limit':true,
        'x-ratelimit-remaining':true,
        'x-ratelimit-reset':true,
    }
})

fastify.register(redisPlugin);
fastify.register(cookie);
fastify.register(multipart);

// Swagger Configuration
fastify.register(swagger, {
  swagger: {
    info: {
      title: '404School API',
      description: 'Complete API documentation for 404School Learning Platform',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'support@404school.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    externalDocs: {
      url: 'http://localhost:3000/api/v1/docs',
      description: 'Find more info here'
    },
    host: process.env.API_HOST || 'localhost:3000',
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Courses', description: 'Course management' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Students', description: 'Student enrollment' },
      { name: 'Coupons', description: 'Coupon management' },
      { name: 'Batches', description: 'Batch management' },
      {name:"Schools",description:"School management"}
    ],
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Enter your bearer token in the format **Bearer &lt;token&gt;**'
      }
    }
  }
});

// Swagger UI
fastify.register(swagger_ui, {
  routePrefix: '/api/v1/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  },
  uiHooks: {
    onRequest: function (request, reply, next) { next(); },
    preHandler: function (request, reply, next) { next(); }
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => { return swaggerObject; },
  transformSpecificationClone: true
});



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