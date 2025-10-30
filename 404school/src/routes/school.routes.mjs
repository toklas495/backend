import SchoolController from "../controllers/school.controller.mjs";
import { checkAuth } from "../middleware/checkAuth.middleware.mjs";

export default async function schoolRoute(fastify, options) {
    const schoolcontroller = new SchoolController();

    fastify.post("/new", {
        preHandler: [checkAuth],
        schema: {
            body: {
                type: "object",
                required: ["name", "address", "email", "phone"],
                additionalProperties: false,
                properties: {
                    name: { type: "string", minLength: 5, maxLength: 200 },
                    address: { type: "string", minLength: 5, maxLength: 500 },
                    email: { type: "string", format: "email" },
                    phone: { type: "string", pattern: "^\\+?[1-9]\\d{1,14}$" }
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
                                id: { type: "string", format: "uuid" }
                            }
                        }
                    }
                }
            }
        }
    }, schoolcontroller.registeredSchool);

    fastify.patch("/:schoolId/logo", {
        schema: {
            params: {
                type: "object",
                properties: {
                    schoolId: { type: "string", format: "uuid" }
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
    }, schoolcontroller.uploadLogo);

    fastify.get("/:schoolId", {
        schema: {
            params: {
                type: "object",
                properties: {
                    schoolId: { type: "string", format: 'uuid' }
                }
            }
        },
        response: {
            200: {
                type: "object",
                properties: {
                    status: { type: 'string' },
                    data: {
                        type: "object", properties: {
                            id: {type:'string',format:"uuid"},
                            name: {type:'string'},
                            address: {type:'string'},
                            email: {type:'string'},
                            phone: {type:'string'},
                            status:{type:"string"},
                            logo_uri: {type:"string"},
                            created_at: {type:"string",format:"date-time"},
                            updated_at: {type:"string",format:"date-time"}
                        }
                    }
                }
            }
        }
    },schoolcontroller.read);

    fastify.get("/",{
        schema:{
            querystring:{
                type:"object",
                required:["query"],
                properties:{
                    query:{type:"string",minLength:1,maxLength:100},
                    limit:{type:"integer",minimum:10,maximum:100,default:10},
                    page:{type:"integer",minimum:1,default:1}
                }
            },
            response:{
                200:{
                    type:"object",
                    properties:{
                        status:{type:"string"},
                        data:{
                            type:"array",
                            items:{
                                type:"object",
                                properties:{
                                    id:{type:"string"},
                                    name:{type:"string"},
                                    address:{type:"string"},
                                    logo_uri:{type:"string"},
                                    updated_at:{type:"string",format:"date-time"},
                                    created_at:{type:"string",format:"date-time"}
                                }
                            }
                        }
                    }
                }
            }
        }
    },schoolcontroller.search);


    fastify.patch("/:schoolId",{
        schema:{
            body:{
                type:"object",
                minProperties:1,
                additionalProperties:false,
                properties:{
                    name:{type:"string"},
                    email:{type:"string",format:'email'},
                    phone: { type: "string", pattern: "^\\+?[1-9]\\d{1,14}$" },
                    address:{type:"string",minLength:5,maxLength:100}
                }
            },
            response:{
                200:{
                    type:"object",
                    properties:{
                        status:{type:"string"}
                    }
                }
            }
        }
    },schoolcontroller.update);


    fastify.post("/:schoolId/teacher",{schema:{
        body:{
            type:"object",
            required:["qualification"],
            properties:{
                qualification:{
                    type:"object",
                    required:["degree","university","year_of_passing","language_known"],
                    additionalProperties:false,
                    properties:{
                        degree:{type:'string',default:""},
                        specialization:{type:"string",default:""},
                        university:{type:'string',default:""},
                        year_of_passing:{type:"string",default:""},
                        experience_year:{type:"integer",minimum:0,maximum:100,default:0},
                        certification:{type:'array',items:{type:"string"},default:[]},
                        languages_known:{type:"array",items:{type:"string"},default:[]} 
                    }}
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
                            id:{type:"string",format:"uuid"}
                        }
                    }
                }
            }
        }
    }},schoolcontroller.applyForTeacher);
    
}