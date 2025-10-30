import ApiError from "../utils/ApiError.mjs";

class School{
    constructor(db){
        this.db = db;

        //binding
        this.registerSchool = this.registerSchool.bind(this);
        this.uploadLogo = this.uploadLogo.bind(this);
        this.read = this.read.bind(this);
        this.update = this.update.bind(this);
        this.search = this.search.bind(this);
        this.insertTeacher = this.insertTeacher.bind(this);
    }


    async registerSchool({principal_id,name,phone,email,address}){
        try{
            
            const user = await this.db("users").where({id:principal_id}).first();
            if(!user || user.role!=="principal") throw new ApiError({message:"user not found",event:"REGISTRATION",status:404,isKnown:true})
            const [school] = await this.db("school")
            .insert({principal_id,name,phone,email,address})
            .returning("id");
            return school.id;
        }catch(error){
            if(error.code==="23505"){
                throw new ApiError({message:"alread exist!",event:"REGISTRATION",status:409,isKnown:true});
            }else if(error.code==="23503"){
                throw new ApiError({message:"user not found!",event:"REGISTRATION",status:409,isKnown:true});
            }
            throw error;
        }
    }

    async uploadLogo(principal_id,school_id,payload){
        try{
            const user = await this.db("users").where({id:principal_id}).first();
            if(!user || user.role!=="principal") throw new ApiError({message:"user not found",event:"REGISTRATION",status:404,isKnown:true})
            const [school] = await this.db("school").update(payload).where({id:school_id,principal_id}).returning("*");
            if(!school) throw new ApiError({message:"school not found!",status:404,event:"UPLOAD",isKnown:true})
        }catch(error){
            if(error.code==="23505"){
                throw new ApiError({message:"alread exist!",event:"UPLOAD_LOGO",status:409,isKnown:true});
            }else if(error.code==="23503"){
                throw new ApiError({message:"user not found!",event:"UPLOAD_LOGO",status:409,isKnown:true});
            }
            throw error;
        }
    }

    async read(schoolId){
        try{
            const school = await this.db("school")
                            .where({id:schoolId})
                            .first();
            return school;
        }catch(error){
            throw error;
        }
    }

    async update({school_id,principal_id,payload}){
        try{
            const [school] = await this.db("school")
                        .update(payload)
                        .where({id:school_id,principal_id})
                        .returning("*");
            if(!school) throw new ApiError({message:"school not found!",event:"UPDATE",status:404,isKnown:true})
        }catch(error){
            if(error.code==="23505"){
                throw new ApiError({message:"alread exist!",event:"UPDATE",status:409,isKnown:true});
            }else if(error.code==="23503"){
                throw new ApiError({message:"user not found!",event:"UPDATE",status:409,isKnown:true});
            }
            throw error;
        }
    }

    async search({query,limit,page}){
        try{
            const offset = (page-1)*limit;
            const schools = await this.db("school")
                            .select(
                                "id",
                                "name",
                                "address",
                                "logo_uri",
                                "updated_at",
                                "created_at"
                            )
                            .where(builder=>{
                                builder.whereILike("name",`%${query}%`)
                                .orWhereILike("address",`%${query}%`)
                            }).orderBy("created_at","desc")
                            .limit(limit)
                            .offset(offset);
            
            return schools;

        }catch(error){
            throw error;
        }
    }

    async insertTeacher({teacher_id,school_id,qualification}){
        try{
            const school = await this.db("school").where({id:school_id}).first();
            if(!school || school.status!=="active") throw new ApiError({message:"school not found!",event:"INSERT_TEACHER",isKnown:true,status:404})
            const [teacher] = await this.db("teacher")
            .insert({teacher_id,school_id,qualification})
            .returning("*");

            return teacher;
                            
        }catch(error){
            if(error.code==="23505"){
                throw new ApiError({message:"alread exist!",event:"INSERT_TEACHER",status:409,isKnown:true});
            }else if(error.code==="23503"){
                throw new ApiError({message:"user or school not found!",event:"INSERT_TEACHER",status:404,isKnown:true});
            }
            throw error;
        }
    }
}

export default School;