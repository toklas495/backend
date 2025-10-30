import School from "../models/school.model.mjs";
import db from '../db/index.mjs';
import asyncHandler  from '../utils/asyncHandler.mjs';
import {saveUploadToTemp} from '../middleware/saveUpload.middleware.mjs';
import uploadAndCleanup from '../utils/cloudupstream.mjs';
import ApiError from "../utils/ApiError.mjs";

class SchoolController{
    constructor(){
        this.schooldb = new School(db);

        //binding
        this.registeredSchool = this.registeredSchool.bind(this);
        this.uploadLogo = this.uploadLogo.bind(this);
        this.read = this.read.bind(this);
        this.update = this.update.bind(this);
        this.search = this.search.bind(this);
        this.applyForTeacher = this.applyForTeacher.bind(this);
    }

    registeredSchool=asyncHandler(async(req,reply)=>{
        const {id:principal_id} = req.user;
        const {name,phone,email,address} = req.body; 
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
        const new_teacher = await this.schooldb.insertTeacher({teacher_id,school_id,qualification:payload})
        return {
            status:"ok",
            data:{
                id:new_teacher.id
            }
        }
    })
}

export default SchoolController;