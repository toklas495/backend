
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
    const isExist = await knex.schema.hasTable("teacher_courses");
    if(!isExist){
        return knex.schema.createTable("teacher_courses",table=>{
            table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
            table.uuid("school_id").notNullable().references("id").inTable("school").onDelete("CASCADE");
            table.uuid("teacher_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
            table.uuid("course_id").notNullable().references("id").inTable('school_course').onDelete("CASCADE");
            table.unique(["teacher_id","course_id","school_id"]);
            table.index(["school_id"]);
            table.timestamps(true,true);
        })
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  return knex.schema.dropTableIfExists("teacher_courses");
};
