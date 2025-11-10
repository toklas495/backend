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
        this.isEmail = this.isEmail.bind(this);
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
                email:user.email,
                full_name:user.full_name,
                role:user.role,
                created_at:user.created_at
            }
        }catch(error){
            throw error;
        }
    }

    async createUser(payload){
        try{
            const hashPassword = await argon2.hash(payload.password,{
                type:argon2.argon2i,
                timeCost:2,
                memoryCost:2**16,
                parallelism:2
            })

            const user_payload = {...payload,password:hashPassword};
            const [user] = await this.db("users").insert(user_payload).returning("*");      
            return user;
        }catch(error){
            throw error;
        }
    }

    async isEmail(email){
        try{
            return await this.db("users").where({email}).first();
        }catch(error){
            throw error;
        }
    }

    async update(userId,payload){
        try{
            const [user] = await this.db("users").update(payload).where({id:userId}).returning("*");
            return user;
        }catch(error){
            throw error;
        }
    }

    async destroy(userId){
        try{
            const [user] = await this.db("users").where({id:userId}).del().returning("*");
            return user;
        }catch(error){
            throw error;
        }
    }

    async read(userId){
        try{
            return  await this.db("users").where({id:userId}).first();
        }catch(error){
            throw error;
        }
    }

    async search(query,limit,offset){
        try{    
            return await this.db("users")
                        .select("id","username","full_name","profile_url","role","is_active","verified","last_login","created_at")
                        .where(builder=>{
                            builder.whereILike("username",`%${query}%`)
                            .orWhereILike("full_name",`%${query}%`)
                        })
                        .limit(limit)
                        .offset(offset)
        }catch(error){
            throw error;
        }
    }
} 

export default UserDb;