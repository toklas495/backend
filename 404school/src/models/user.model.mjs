import ApiError from "../utils/ApiError.mjs";
import argon2 from 'argon2';

class UserDb{
    constructor(db){
        this.db = db;

        //binding
        this.createUser = this.createUser.bind(this);
        this.update = this.update.bind(this);
        this.destroy = this.destroy.bind(this);
        this.read = this.read.bind(this);
        this.search = this.search.bind(this);
        this.checkCred = this.checkCred.bind(this);
    }

    async checkCred(payload,password){
        try{
            const user = await this.db('users').where(payload).first();
            if(!user || !user.verified || !await argon2.verify(user.password,password)){
                throw new ApiError({message:"user not found!",event:"LOGIN",isKnown:true,status:404});
            }
            return {
                id:user.id,
                username:user.username,
                full_name:user.full_name,
                role:user.role,
                created_at:user.created_at
            }
        }catch(error){
            throw error;
        }
    }

    async createUser(email,payload){
        try{
            const isExist = await this.db("users").where({email}).first();
            if(isExist) throw new ApiError({message:"Already Exist!",event:"REGISTER",isKnown:true,status:409})
            const hashPassword = await argon2.hash(payload.password,{
                type:argon2.argon2i,
                timeCost:2,
                memoryCost:2**16,
                parallelism:2
            })

            const user_payload = {...payload,password:hashPassword};
            await this.db("users").insert(user_payload)        
        }catch(error){
            throw error;
        }
    }

    async update(userId,payload){
        try{
            const user = await this.db("users").update(payload).where({id:userId}).returning("*");
            if(!user) throw new ApiError({message:"user not found!",event:"UPDATE",isKnown:true,status:404});
        }catch(error){
            throw error;
        }
    }

    async destroy(userId){
        try{
            const user = await this.db("users").where({id:userId}).del().returning("*");
            if(!user) throw new ApiError({message:"user not found!",event:"DESTROY",isKnown:true,status:404});
        }catch(error){
            throw error;
        }
    }

    async read(userId){
        try{
            const user = await this.db("users").where({id:userId}).first();
            return {
                id:user.id,
                username:user.username,
                full_name:user.full_name,
                email:user.email,
                phone:user.phone,
                profile_url:user.profile_url,
                role:user.role,
                is_active:user.is_active,
                verified:user.verified,
                updated_at:user.updated_at,
                created_at:user.created_at
            }
        }catch(error){
            throw error;
        }
    }

    async search(query,limit,page){
        try{    
            const offset = (page-1)*limit;
            const users = await this.db("users")
                        .select("id","username","full_name","profile_url","role","is_active","verified","last_login","created_at")
                        .where(builder=>{
                            builder.whereILike("username",`%${query}%`)
                            .orWhereILike("full_name",`%${query}%`)
                        })
                        .limit(limit)
                        .offset(offset)
            return users;
        }catch(error){
            throw error;
        }
    }
} 

export default UserDb;