import School from "../models/school.model.mjs";
import db from '../db/index.mjs';
import UserDb from '../models/user.model.mjs';
import Course from '../models/course.model.mjs';
import asyncHandler  from '../utils/asyncHandler.mjs';
import {saveUploadToTemp} from '../middleware/saveUpload.middleware.mjs';
import uploadAndCleanup from '../utils/cloudupstream.mjs';
import ApiError, { BADREQUEST, FORBIDDEN, NOTFOUND } from "../utils/ApiError.mjs";
import Student from "../models/student.model.mjs";

class SchoolController{
    constructor(){
        this.schooldb = new School(db);
        this.userdb = new UserDb(db);
        this.coursedb = new Course(db);
        this.studentdb = new Student(db);

        //binding
        this.registeredSchool = this.registeredSchool.bind(this);
        this.uploadLogo = this.uploadLogo.bind(this);
        this.read = this.read.bind(this);
        this.update = this.update.bind(this);
        this.search = this.search.bind(this);
        this.applyForTeacher = this.applyForTeacher.bind(this);
        this.addBatch = this.addBatch.bind(this);
        this.addStudent = this.addStudent.bind(this);
    }


    registeredSchool=asyncHandler(async(req,reply)=>{
        const {id:principal_id} = req.user;
        const {name,phone,email,address} = req.body; 
        const user = await this.userdb.read(principal_id);
        if(!user || user.role!=="principal") throw new NOTFOUND({event:"REGISTERED_SCHOOL",message:"user not found or authorized"})
        const schoolId = await this.schooldb.registerSchool(
            {
                principal_id,
                name:name.toUpperCase(),
                phone,
                email:email.toLowerCase(),
                address:address.toLowerCase()
            }
        )
        return {
            status:"ok",
            data:{
                id:schoolId
            }
        }
    })

    uploadLogo = asyncHandler(async(req,reply)=>{
        const {schoolId} = req.params;
        const {id:principal_id} = req.user; 
        const parts = req.parts();
        const field = {}
        for await (let part of parts){
            if(part.file){
                if(part.fieldname==="logo"){
                    const localpath = await saveUploadToTemp(part);
                    const logo_uri = await uploadAndCleanup(localpath);
                    field["logo_uri"] = logo_uri;
                }
            }
        }
        await this.schooldb.uploadLogo(principal_id,schoolId,field);
        return {
            status:"ok"
        }
    })

    read = asyncHandler(async(req,reply)=>{
        const {id:user_id} = req?.user||{};
        const {schoolId} = req.params;
        const school = await this.schooldb.read(schoolId);
        if(!school || (school.status!=="active" && school.principal_id!==user_id)){
            throw new ApiError({message:"school not found!",event:"READ",isKnown:true,status:404})
        }
        return {
            status:"ok",
            data:{
                id:school.id,
                name:school.name,
                address:school.address,
                email:school.email,
                phone:school.phone,
                ...(school.status!=="active"&&{status:school.status}),
                logo_uri:school.logo_uri,
                created_at:school.created_at,
                updated_at:school.updated_at
            }
        }
    })

    update = asyncHandler(async(req,reply)=>{
        const {id:principal_id} = req.user;
        const {schoolId} = req.params;
        const {name,address,email,phone} = req.body;
        const payload = {
            ...(name!==undefined&&{name}),
            ...(address!==undefined&&{address}),
            ...(email!==undefined&&{email}),
            ...(phone!==undefined&&{phone}),
            status:"pending"
        }
        await this.schooldb.update({school_id:schoolId,principal_id,payload});
        return {
            status:"ok"
        }
    })


    search = asyncHandler(async(req,reply)=>{
        const {query,limit,page} = req.query;
        const schools = await this.schooldb.search({query,limit,page});
        return {
            status:"ok",
            data:schools
        }
    })

    applyForTeacher = asyncHandler(async(req,reply)=>{
        const {schoolId:school_id} = req.params;
        const {id:teacher_id} = req.user;
        const {qualification} = req.body;
        const payload = {
            degree:qualification.degree,
            specialization:qualification.specialization,
            university:qualification.university,
            year_of_passing:qualification.year_of_passing,
            experience_year:qualification.experience_year,
            certification:qualification.certification,
            languages_known:qualification.languages_known
        }
        const user = await this.userdb.read(teacher_id);
        if(!user||!["teacher","principal","admin"].some(role=>role===user.role))throw new FORBIDDEN({event:"APPLY_FOR_TEACHER",message:"Teacher  have permission to apply!"})
        const new_teacher = await this.schooldb.insertTeacher({teacher_id,school_id,qualification:payload})
        return {
            status:"ok",
            data:{
                id:new_teacher.id
            }
        }
    })

    addBatch = asyncHandler(async(req,reply)=>{
        const {schoolId:school_id,courseId:course_id} = req.params;
        const {id:user_id} = req.user;
        const {name,start_time,end_time,start_date,end_date,plan} = req.body;
        const user = await this.userdb.read(user_id);
        if(!user || !["teacher","principal","admin"].some(role=>role===user.role)) throw new FORBIDDEN({event:"ADD_BATCH",message:"you are not teacher!"})
        if(user.role==="principal"){
            const school = await this.schooldb.read(school_id);
            if(school.principal_id!==user_id) throw new NOTFOUND({event:"ADD_BATCH",message:"school not found!"});
        }else if(user.role==="teacher"){
            const teacher = await this.schooldb.readTeacher({teacher_id:user_id,school_id});
            if(!teacher) throw new NOTFOUND({event:"ADD_BATCH",message:"school not found!"});
        } 

        if(start_time>end_time|| start_date>end_date) throw new BADREQUEST({event:"ADD_BATCH",message:"how ending is small as compared to starting!"})
         
        const timing = `${start_time}-${end_time}`;
        const batch = await this.schooldb.insertBatch({
            name,timing,start_date,end_date,plan,course_id,school_id,teacher_id:user_id
        })
        return {
            status:"ok",
            data:{
                id:batch.id
            }
        }
    })


    addStudent = asyncHandler(async(req,reply)=>{
        const {schoolId:school_id,courseId:course_id} = req.params;
        const {id:user_id} = req.user||{};
        const {batch_id} = req.body;
        const user = await this.userdb.read(user_id);
        if(!user || !["student","admin","principal"].some(role=>role===user.role)){
            throw new FORBIDDEN({event:"ADD_STUDENT"});
        }
        const batch = await this.coursedb.readBatchWithId(batch_id);
        if(!batch || batch.school_id!==school_id || batch.course_id!==course_id || batch.start_date<new Date()) throw new NOTFOUND({event:"ADD_STUDENT",message:"batch not found!"});
        const total_student = await this.studentdb.countStudents({batch_id});
        if(total_student>batch.capacity) throw new ApiError({message:"limit exceed! sorry you can try another batch...",event:"ADD_STUDENT",isKnown:true,status:400});
        await this.studentdb.insertStudent({user_id,school_id,course_id,batch_id});
        return {
            status:"ok"
        }
    })
}

export default SchoolController;