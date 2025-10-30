import {default as userRouter} from './user.route.mjs';
import {default as authRouter} from './auth.routes.mjs';
import schoolRoute from './school.routes.mjs';

export default async function indexRouter(fastify,options){
    fastify.register(userRouter,{prefix:"/users"});
    fastify.register(authRouter,{prefix:"/auth"});
    fastify.register(schoolRoute,{prefix:"/school"});
}


