import ApiError from "../utils/ApiError.mjs";

class AuthModel{
    constructor(db){
        this.db = db;

        this.expiry = 7*24*60*60*1000
        //binding

        this.insertToken = this.insertToken.bind(this);
        this.refreshToken = this.refreshToken.bind(this);

    }

    async insertToken(refresh_token,session_token,user_id,session_limit=5){
        const trx = await this.db.transaction();
        try{
            await trx("user_sessions")
            .whereIn("id",function(){
                this.select("id")
                .from("user_sessions")
                .where({user_id,is_deleted:false})
                .orderBy("created_at","desc")
                .offset(session_limit)
            }).update({is_deleted:true,updated_at:new Date()});

            const expires_at = new Date(Date.now()+this.expiry);
            await trx("user_sessions")
            .insert({
                user_id,
                refresh_token,
                session_token,
                expires_at,
                is_deleted:false
            })
            await trx.commit();
        }catch(error){
            await trx.rollback();
            throw error;
        }
    }

    async refreshToken(refresh_token,session_token,new_refresh_token){
        const now = new Date();
        const trx = await this.db.transaction();
        try{
            const session = await trx("user_sessions")
                                .where({refresh_token})
                                .first()
                                .forUpdate()
            
            if(
                !session ||
                session.session_token!==session_token ||
                session.is_deleted ||
                session.expires_at<now
            ){
                throw new ApiError({message:"invalid token!",status:401,isKnown:true,event:"REFRESH"});
            }

            await trx("user_sessions")
            .update({is_deleted:true,updated_at:new Date()})
            .where({id:session.id});

            await trx("user_sessions")
            .insert({
                session_token,
                user_id:session.user_id,
                refresh_token:new_refresh_token,
                expires_at:session.expires_at,
                created_at:session.created_at,
                updated_at:now,
                is_deleted:false
            })

            await trx.commit();
            return session.user_id;
        }catch(error){
            await trx.rollback();
            throw error;
        }
    }

}

export default AuthModel;