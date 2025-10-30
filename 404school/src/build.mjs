import {default as Fastify} from 'fastify';
import {default  as cookie} from '@fastify/cookie';
import {default as multipart} from '@fastify/multipart';
import {default as router} from './routes/index.mjs';
import {default as verifyContentType } from './middleware/verifyContentType.mjs';
import {authMiddleware} from './middleware/checkAuth.middleware.mjs';
import errorHandler from './utils/errorHandler.mjs';

const fastify = Fastify({
    logger:true
});


fastify.register(cookie);
fastify.register(multipart);
fastify.addHook("onRequest",verifyContentType);
fastify.addHook("onRequest",authMiddleware);
// routes

fastify.register(router,{prefix:"/api/v1"});

//handler
fastify.setErrorHandler(errorHandler);

export default fastify;