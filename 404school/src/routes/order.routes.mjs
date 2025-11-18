import OrderController from "../controllers/order.controller.mjs";
import { checkAuth } from '../middleware/checkAuth.middleware.mjs';

export default async function (fastify, options) {
    const ordercontroller = new OrderController();

    fastify.get("/:orderId", {
        preHandler: [checkAuth],
        schema: {
            params: {
                type: "object",
                required: ["orderId"],
                properties: {
                    orderId: { type: "string", format: "uuid" }
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
                                id: { type: "string" },
                                order_number: { type: "string" },
                                user_id: { type: "string" },
                                course_id: { type: "string" },
                                batch_id: { type: "string" },
                                amount: { type: "integer" },
                                discount: { type: "string" },
                                tax: { type: "integer" },
                                total_amount: { type: 'integer' },
                                currency: { type: "string" },
                                coupon_code: { type: "string" },
                                created_at: { type: "string" }
                            }
                        }
                    }
                }
            }
        }
    }, ordercontroller.getOrderDetail);


    fastify.get("/me", {
        preHandler: [checkAuth],
        schema: {
            response: {
                200: {
                    type: "object",
                    properties: {
                        status: { type: "string" },
                        data: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    order_number: { type: "string" },
                                    course_title:{type:"string"},
                                    batch_name:{type:"string"},
                                    user_id: { type: "string" },
                                    course_id: { type: "string" },
                                    batch_id: { type: "string" },
                                    amount: { type: "integer" },
                                    discount: { type: "string" },
                                    tax: { type: "integer" },
                                    total_amount: { type: 'integer' },
                                    currency: { type: "string" },
                                    coupon_code: { type: "string" },
                                    created_at: { type: "string" }
                                }
                            }
                        }
                    }
                }
            }
        }
    },ordercontroller.getUserDetails);
}