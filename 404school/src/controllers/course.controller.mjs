import Course from "../models/course.model.mjs";
import UserDb from "../models/user.model.mjs";
import School from "../models/school.model.mjs";
import db from "../db/index.mjs";
import asyncHandler from '../utils/asyncHandler.mjs';
import ApiError, { NOTFOUND } from "../utils/ApiError.mjs";

class CourseController {
    constructor(){
        this.courseDb = new Course(db);
        this.userDb = new UserDb(db);
        this.schoolDb = new School(db);
        //binding
        this.addCourse = this.addCourse.bind(this);
        this.destroyCourse = this.destroyCourse.bind(this);
        this.readCourse = this.readCourse.bind(this);
        this.getCourseDetail = this.getCourseDetail.bind(this);
        this.search = this.search.bind(this);
    }

    addCourse = asyncHandler(async(req,reply)=>{
        // add course
        const {id:teacher_id} = req.user||{};
        const {name,description} = req.body;
        const {schoolId:school_id} = req.params;
        const user = await this.userDb.read(teacher_id);
        if(!["principal","teacher"].some((role)=>role===user.role)) throw new ApiError({message:"school not found!",status:404,event:"ADD_COURSE",isKnown:true})
        if(user.role==="teacher"){
            const school = await this.schoolDb.readTeacher({school_id,teacher_id});
            if(!school) throw new ApiError({message:"school not found",isKnown:true,status:404,event:"ADD_COURSE"});
        }else if(user.role==="principal") {
            const school = await this.schoolDb.read(school_id);
            if(!school || school.principal_id!==teacher_id) throw new ApiError({message:"school not found",isKnown:true,status:404,event:"ADD_COURSE"})
        }
        const course = await this.courseDb.insertCourse({teacher_id,school_id,name,description});
        return {
            status:"ok",
            data:{
                id:course.id,
                name:course.name,
                school_id:course.school_id,
                teacher_id:course.teacher_id,
                description:course.description,
                created_at:course.created_at
            }
        }
    })

    destroyCourse = asyncHandler(async(req,reply)=>{
        //delete course
        const {id:teacher_id} = req?.user||{};
        const {schoolId:school_id} = req.params;
        const {courseId:course_id} = req.params;
        const user = await this.userDb.read(teacher_id)||{};
        if(!["admin","teacher","principal"].some(role=>role===user.role)){
            throw new ApiError({message:"course not found!",event:"DESTROY",isKnown:true,status:404});
        }

        if(user.role==="admin"){
            await this.courseDb.destroy({course_id});
        }
        else if(user.role==="teacher"){
            const course = await this.courseDb.readCourse({course_id,school_id});
            if(!course || course.teacher_id!==teacher_id) throw new ApiError({message:"course not found!",event:"DESTROY",isKnown:true,status:404});
            await this.courseDb.destroy({course_id});
        }
        else if(user.role==="principal"){
            const school = await this.schoolDb.read(school_id);
            if(!school || school.principal_id!==user.role) throw new ApiError({message:"course not found!",event:"DESTROY",isKnown:true,status:404});
            await this.courseDb.destroy({course_id});
        }
        
        return {
            status:"ok"
        }
    })

    readCourse = asyncHandler(async(req,reply)=>{
        // read course
        const {courseId:course_id} = req.params;
        const course = await this.courseDb.read({course_id});
        return {
            status:"ok",
            data:{
                id:course.id,
                name:course.name,
                description:course.description,
                amount:course.amount,
                school_id:course.school_id,
                teacher_id:course.teacher_id,
                created_at:course.created_at,
                updated_at:course.updated_at
            }
        }
    })

    getCourseDetail = asyncHandler(async(req,reply)=>{
        //read course
        const {courseId:course_id} = req.params;
        const school_course = await this.courseDb.read({course_id});
        if(!school_course) throw new NOTFOUND({event:"GET_COURSE_DETAIL",message:"course not found!"});
        const school = await this.schoolDb.readWithPrincipal(school_course.school_id);
        return {
            status:"ok",
            data:{
                ...school_course,
                school:{
                    ...school
                }
            }
        }
    })

    search = asyncHandler(async(req,reply)=>{
        const {query,limit,page} = req.query;
        const offset = (page-1)*limit;
        const results = await this.courseDb.search({query,limit,offset});
        const courseIds = results.map(course=>course.id);
        const batches = await this.courseDb.readBatch(courseIds);
        const courseBatchMap = results.reduce((acc,course)=>{
            acc[course.id] = batches.filter(b => b.course_id === course.id);
            return acc;
        },{})

        const response = results.map(course=>{
            const batches = courseBatchMap[course.id];
            return {
                id:course.id,
                school_id:course.school_id,
                name:course.name,
                description:course.description,
                amount:course.amount,
                batches,
                created_at:course.created_at
            }
        })

        return {
            status:"ok",
            data:response
        }
    })


    

}

export default CourseController;