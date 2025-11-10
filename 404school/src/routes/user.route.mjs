
import UserController from '../controllers/user.controller.mjs';
import { checkAuth } from '../middleware/checkAuth.middleware.mjs';



export default async function userRouter(fastify, options) {
    const usercontroller = new UserController(fastify);
    fastify.post("/register", {
        schema: {
            body: {
                type: "object",
                required: ["username", "email", "password", "full_name", "role"],
                properties: {
                    username: { type: "string", minLength: 3, maxLength: 50 },
                    email: { type: "string", format: "email", maxLength: 100, },
                    password: { type: "string", minLength: 10, maxLength: 50 },
                    full_name: { type: "string", minLength: 5, maxLength: 100 },
                    role: { type: "string", enum: ["teacher", "student", "parent", "principal"] }
                }
            },
            response: {
                201: {
                    type: "object",
                    properties: {
                        status: { type: "string" }
                    }
                }
            }
        }
    }, usercontroller.register);


    //update 
    fastify.patch("/update",{preHandler:[checkAuth]}, usercontroller.update);

    // read
    fastify.get("/me", {
        preHandler:[checkAuth],
        schema: {
            params: {
                type: "object",
                properties: {
                    userId: { type: "string", format: "uuid" }
                }
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        status: { type: "string" },
                        data: {
                            type: "object", properties: {
                                id: { type: "string" },
                                username: { type: "string" },
                                full_name: { type: "string" },
                                email: { type: "string" },
                                phone: { type: "string" },
                                profile_url: { type: "string" },
                                role: { type: "string" },
                                is_active: { type: "boolean" },
                                verified: { type: "boolean" },
                                updated_at: { type: "string" },
                                created_at: { type: "string" }
                            }
                        }
                    }
                }
            }
        }
    },usercontroller.read)


    // destroy

    fastify.delete("/del", {
        preHandler:[checkAuth],
        schema: {
            params: {
                type: "object",
                properties: {
                    userId: { type: "string" }
                }
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        status: { type: "string" }
                    }
                }
            }
        }
    },usercontroller.destroy);

    fastify.get("/",  {
        schema: {
            querystring: {
                type: "object",
                required: ["query"],
                properties: {
                    query: { type: "string", minLength: 1, maxLength: 100 },
                    limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
                    page: { type: "integer", minimum: 1, default: 1 }
                }
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        status: { type: "string" },
                        data: {
                            type: "array", items: {
                                type: "object", properties: {
                                    id: { type: "string" },
                                    username: { type: "string" },
                                    full_name: { type: "string" },
                                    role: { type: "string" },
                                    is_active: { type: "boolean" },
                                    verified: { type: "boolean" },
                                    last_login: { type: "string" },
                                    created_at: { type: "string" }
                                }
                            }
                        }
                    }
                }
            }
        }
    },usercontroller.search)
}


