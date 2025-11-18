import SchoolController from "../controllers/school.controller.mjs";
import CourseController from "../controllers/course.controller.mjs";
import { checkAuth } from "../middleware/checkAuth.middleware.mjs";


export default async function schoolRoute(fastify, options) {
    const schoolcontroller = new SchoolController();
    const coursecontroller = new CourseController();

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


    fastify.post("/:schoolId/teacher",{preHandler:[checkAuth],schema:{
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

    fastify.post("/:schoolId/course/new",{preHandler:[checkAuth],schema:{
        params:{
            type:"object",
            required:["schoolId"],
            properties:{
                schoolId:{type:"string",format:"uuid"}
            }
        },
        body:{
            type:"object",
            required:["name","description","amount"],
            additionalProperties:false,
            properties:{
                name:{type:"string",minLength:3,maxLength:300},
                description:{type:"string",minLength:3,maxLength:1000},
                amount:{type:"integer",minimum:0,maximum:5000,default:0},
                currency:{type:"string",minLength:3,maxLength:3,default:"INR"},
                level:{type:"string",enum:["beginner","intermediate","advanced"],default:"beginner"}
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
                            id:{type:"string",format:"uuid"},
                            name:{type:"string"},
                            school_id:{type:"string"},
                            teacher_id:{type:"string"},
                            description:{type:"string"},
                            created_at:{type:"string"}
                        }
                    }
                }
            }
        }
    }},coursecontroller.addCourse);

    fastify.delete("/:schoolId/course/:courseId",{
        schema:{
            params:{
                type:"object",
                properties:{
                    schoolId:{type:"string",format:"uuid"},
                    courseId:{type:'string',format:"uuid"}
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
    },coursecontroller.destroyCourse);



    fastify.post("/:schoolId/course/:courseId/add",{
        preHandler:[checkAuth],
        schema:{
            body:{
                type:"object",
                required:["batch_name","timing","class_start_time","class_end_time","start_date","end_date","max_student"],
                properties:{
                    batch_name:{type:"string",minLength:10,maxLength:1000},
                    timing:{type:"string",enum:["morning","arternoon","evening","weekend"],default:"morning"},
                    class_start_time:{type:"string",format:"time"},
                    class_end_time:{type:"string",format:"time"},
                    start_date:{type:"string",format:"date"},
                    end_date:{type:"string",format:"date"},
                    max_student:{type:"integer",default:30,maximum:5000,minimum:30}
                },
                additionalProperties:false
            },response:{
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
        }
    },schoolcontroller.addBatch)
}