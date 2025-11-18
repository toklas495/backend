import ApiError from "../utils/ApiError.mjs";

class Course{
    constructor(db){
        this.db = db;
        //binding

        this.insertCourse = this.insertCourse.bind(this);
        this.destroy = this.destroy.bind(this);
        this.read = this.read.bind(this);
        this.search = this.search.bind(this);
        this.readBatch = this.readBatch.bind(this);
        this.readBatchWithId = this.readBatchWithId.bind(this);
    }

    async search({query,limit,offset}){
        try{
            const result = await this.db("course as c")
                            .select(
                                "sc.id as id",
                                "sc.school_id as school_id",
                                "c.name as name",
                                "sc.description as description",
                                "sc.amount as amount",
                                "sc.level as level",
                                "sc.thumbnail_url as thumbnail_url",
                                "sc.currency as currency",
                                "sc.created_at as created_at"
                            ).innerJoin("school_course as sc","sc.course_id","c.id")
                            .whereILike("c.name",`%${query}%`)
                            .orderBy("created_at","desc")
                            .limit(limit)
                            .offset(offset);
           
            return result;
        }catch(error){
            throw error;
        }
    }

    async readBatch(courseIds){
        try{
            return await this.db("batch_course")
                        .whereIn("course_id",courseIds);
        }catch(error){
            throw error;
        }
    }

    async readBatchWithId(batchId){
        try{
            return await this.db("batch_course")
                        .where({id:batchId})
                        .first();
        }catch(error){
            throw error;
        }
    }

    async read({course_id}){
        try{
            return await this.db("school_course as sc")
                    .select(
                        "sc.id",
                        "sc.name",
                        "sc.description",
                        "sc.currency",
                        "sc.level",
                        "sc.thumbnail_url",
                        "sc.amount",
                        "sc.currency",
                        "sc.school_id",
                        "tc.teacher_id as teacher_id",
                        "sc.created_at",
                        "sc.updated_at"
                    ).leftJoin("teacher_courses as tc","sc.id","tc.course_id")
                    .where("sc.id",course_id)
                    .first();
        }catch(error){
            throw error;
        }
    }


    async insertCourse({
        teacher_id,
        school_id,
        name,
        description,
        amount,
        currency,
        thumbnail_url,
        level,
        
    }){
        const trx = await this.db.transaction();
        try{
            const [course] = await trx("course")
                            .insert({name})
                            .onConflict("name")
                            .merge()
                            .returning("*");
            const payload = {
                course_id:course.id,
                school_id,
                name,
                description:description||course.default_description,
                amount,
                currency,
                ...(thumbnail_url!==undefined&&thumbnail_url),
                level
            }
            const [school_course] = await trx("school_course")
            .insert(payload).returning("*");


            await trx("teacher_courses")
            .insert({school_id,teacher_id,course_id:school_course.id});

            await trx.commit();
            return {
                id:school_course.id,
                name:course.name,
                school_id:school_id,
                teacher_id:teacher_id,
                description:school_course.description,
                created_at:school_course.created_at
            }
        }catch(error){
            await trx.rollback();
            if(error.code==="23505"){
                throw new ApiError({message:"alread exist!",event:"REGISTRATION",status:409,isKnown:true});
            }else if(error.code==="23503"){
                throw new ApiError({message:"user not found!",event:"REGISTRATION",status:409,isKnown:true});
            }
            throw error;
        }
    }

    async readteacherCourse(payload){
        try{
            return await this.db("school_courses").where(payload).first();
        }catch(error){
            throw error;
        }
    }
    async destroy({course_id}){
        try{    
            const [course] = await this.db("school_course")
                            .where({id:course_id})
                            .del()
                            .returning("*");
            return course;
        }catch(error){
            throw error;
        }
    }
}

export default Course;