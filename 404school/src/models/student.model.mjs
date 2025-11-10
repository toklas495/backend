import ApiError from "../utils/ApiError.mjs";

class Student{
    constructor(db){
        this.db = db;

        //binding
        this.insertStudent = this.insertStudent.bind(this); 
        this.countStudents = this.countStudents.bind(this);
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
}

export default Student;