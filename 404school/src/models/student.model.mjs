import ApiError from "../utils/ApiError.mjs";

class Student{
    constructor(db){
        this.db = db;

        //binding
        this.insertStudent = this.insertStudent.bind(this); 
        this.countStudents = this.countStudents.bind(this);
        this.read = this.read.bind(this);
        this.getStudentCourse = this.getStudentCourse.bind(this);
    }

    async countStudents(payload){
        try{
            const result  = await this.db("student")
                            .where(payload)
                            .count('* as total')
                            .first();
            return result.total;
        }catch(error){
            throw error;
        }
    }

    async read(payload){
        try{
            return await this.db("student")
                        .where(payload)
                        .first();
        }catch(error){
            throw error;
        }
    }

    async insertStudent(payload){
        try{
            const [student] = await this.db("student")
                            .insert(payload)
                            .returning("*");
            return student;
        }catch(error){
            if(error.code==="23505"){
                throw new ApiError({message:"alread exist!",event:"INSERT_STUDENT",status:409,isKnown:true});
            }else if(error.code==="23503"){
                throw new ApiError({message:"user not found!",event:"INSERT_STUDENT",status:404,isKnown:true});
            }
            throw error;
        }
    }


    async getStudentCourse(userId){
        try{
            return await this.db("student")
            .where({user_id:userId})
            .join('school_course',"student.course_id","school_course.id")
            .leftJoin("batch_course","student.batch_id","batch_course.id")
            .select(
                'student.*',
                'student_course.title as course_title',
                'school_course.thumbnail_url',
                'batch_course.batch_name',
                'batch_course.class_start_time',
                'batch_course.class_end_time'
            ).orderBy('student.created_at','desc');
        }catch(error){
            throw error;
        }
    }
}

export default Student;