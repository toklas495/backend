import CourseController from "../controllers/course.controller.mjs";

export default async function (fastify, options) {
    const coursecontroller = new CourseController();


    
    
    fastify.get("/search",{
        schema:{
            querystring:{
                type:"object",
                required:["query"],
                properties:{
                    query:{type:"string"},
                    limit:{type:"integer",default:10,minimum:1,maximum:100},
                    page:{type:"integer",minimum:1,default:1}
                }
            },
            response:{
                200:{
                    type:"object",
                    properties:{
                        status:{type:"string"},
                        data:{type:"array",items:{
                            type:"object",
                            properties:{
                                id:{type:"string"},
                                school_id:{type:"string"},
                                name:{type:"string"},
                                amount:{type:"integer"},
                                description:{type:"string"},
                                created_at:{type:"string"},
                                batches:{
                                    type:"array",
                                    items:{
                                        type:"object",
                                        properties:{
                                            id:{type:"string",format:"uuid"},
                                            teacher_id:{type:"string",format:"uuid"},
                                            name:{type:"string"},
                                            timing:{type:"string"},
                                            start_date:{type:"string"},
                                            end_date:{type:"string"},
                                            plan:{type:"string"},
                                            created_at:{type:"string"}
                                        }
                                    }
                                }

                            }
                        }}
                    }
                }
            }
        }
    },coursecontroller.search);


    fastify.get("/:courseId", {
        schema: {
            params: {
                type: "object",
                properties: {
                    courseId: { type: "string", format: "uuid" }
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
                                id: {type:"string",format:"uuid"},
                                name: {type:"string"},
                                description: {type:"string"},
                                school_id: {type:'string',fromat:"uuid"},
                                teacher_id: {type:"string",format:"uuid"},
                                created_at: {type:"string"}
                            }
                        }
                    }
                }
            }
        }
    },coursecontroller.readCourse);


    fastify.get("/:courseId/details",{
        schema:{
            params:{
                type:"object",
                properties:{
                    courseId:{type:'string',format:'uuid'}
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
                                description:{type:"string"},
                                amount:{type:"integer"},
                                school_id:{type:"string",format:"uuid"},
                                teacher_id:{type:"string",format:"uuid"},
                                created_at:{type:"string",format:"date-time"},
                                updated_at:{type:"string",format:"date-time"},
                                school:{
                                    type:"object",
                                    properties:{
                                        id:{type:"string",format:"uuid"},
                                        name:{type:"string"},
                                        address:{type:"string"},
                                        phone:{type:"string"},
                                        email:{type:"string",format:"email"},
                                        logo_uri:{type:"string"},
                                        principal_id:{type:"string",foramt:"uuid"},
                                        username:{type:"string"},
                                        full_name:{type:"string"},
                                        created_at:{type:"string",format:"date-time"}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },coursecontroller.getCourseDetail)
}