import CouponController from "../controllers/coupon.controller.mjs";
import { checkAuth } from '../middleware/checkAuth.middleware.mjs';

export default async function (fastify, options) {
    const couponcontroller = new CouponController();


    fastify.post("/new", {
        config:{
            rateLimit:{
                max:5,
                timeWindow:"1 min",
                keyGenerator:(request)=>{
                    return `${request.ip}:${request.headers["user-agent"]}:${request?.user?.id}`
                }
            }
        },
        preHandler: [checkAuth],
        schema: {
            body: {
                type: "object",
                properties: {
                    code: { type: 'string' },
                    discount_type: { type: 'string', enum: ["percentage", "fixed"], default: "fixed" },
                    discount_value: { type: "number" },
                    min_purchase_amount: { type: "number" },
                    max_discount_amount: { type: "number" },
                    usage_limit: { type: "integer", default: 10 },
                    valid_from: { type: "string", format: "date" },
                    valid_until: { type: "string", format: 'date' }
                }
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        status: { type: "string" },
                        data: {
                            type: "object",
                            properties: {
                                id:{type:'string'},
                                code: { type: 'string' },
                                discount_type: { type: 'string', enum: ["percentage", "fixed"], default: "fixed" },
                                discount_value: { type: "number" },
                                min_purchase_amount: { type: "number" },
                                max_discount_amount: { type: "number" },
                                usage_limit: { type: "integer", default: 10 },
                                valid_from: { type: "string", },
                                valid_until: { type: "string", },
                                
                            }
                        }
                    }
                }
            }
        }
    },couponcontroller.createCoupon);
}