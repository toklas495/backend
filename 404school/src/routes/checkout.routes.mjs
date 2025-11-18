import CheckOutController from "../controllers/checkout.controller.mjs";
import { checkAuth } from "../middleware/checkAuth.middleware.mjs";


export default async function (fastify,options){
    const checkoutcontroller = new CheckOutController();

    fastify.post("/create-order",{preHandler:[checkAuth],schema:{  
        body:{
            type:"object",
            required:["course_id","batch_id"],
            properties:{
                course_id:{type:"string",format:"uuid"},
                batch_id:{type:"string",format:"uuid"},
                coupon_code:{type:"string"}
            }
        },
        response:{
            200:{
                type:"object",
                properties:{
                    status:{type:"string"},
                    data:{
                        type:"object",
                        properties:{
                            razorPayOrderId:{type:"string"},
                            amount:{type:"string"},
                            currency:{type:"string"},
                            paymentId:{type:"string"}
                        }
                    }
                }
            }
        }
    }},checkoutcontroller.createOrder);


    fastify.post("/verify-payment",{preHandler:[checkAuth],
       schema:{
        body:{
            type:"object",
            required:["razorpay_order_id","razorpay_payment_id","razorpay_signature","payment_id"],
            properties:{
                razorpay_order_id:{type:"string"},
                razorpay_payment_id:{type:"string"},
                razorpay_signature:{type:"string"},
                payment_id:{type:"string"}
            },
            additionalProperties:false
        }
        ,response:{
            200:{
                type:'object',
                properties:{
                    status:{type:"string"},
                    data:{
                        type:"object",
                        properties:{
                            student:{
                                type:"object",
                                properties:{
                                    id:{type:"string",format:"uuid"},
                                    user_id:{type:"string",format:"uuid"},
                                    school_id:{type:"string",format:"uuid"},
                                    course_id:{type:"string",format:"uuid"},
                                    batch_id:{type:"string",format:"uuid"},
                                    completed_at:{type:"string",format:"uuid"}
                                }
                            },
                            payment:{
                                type:"object",
                                properties:{
                                    id:{type:"string",format:"uuid"},
                                    order_id:{type:"string",format:"uuid"},
                                    payment_gateway:{type:"string"},
                                    gateway_order_id:{type:"string"},
                                    gateway_payment_id:{type:"string"},
                                    amount:{type:"integer"},
                                    currency:{type:"string"},
                                    payment_method:{type:"string"},
                                    paid_at:{type:"string"}
                                }
                            }
                        }
                    }
                }
            }
        }
    }},checkoutcontroller.verifyPayment);
}