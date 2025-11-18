import {default as userRouter} from './user.route.mjs';
import {default as authRouter} from './auth.routes.mjs';
import courseRoutes from './course.routes.mjs';
import schoolRoute from './school.routes.mjs';
import checkoutRoute from './checkout.routes.mjs';
import orderRoutes from './order.routes.mjs';

export default async function indexRouter(fastify,options){
    fastify.register(userRouter,{prefix:"/users"});
    fastify.register(authRouter,{prefix:"/auth"});
    fastify.register(schoolRoute,{prefix:"/school"});
    fastify.register(courseRoutes,{prefix:"/course"});
    fastify.register(checkoutRoute,{prefix:"/checkout"});
    fastify.register(orderRoutes,{prefix:"/orders"});
}


