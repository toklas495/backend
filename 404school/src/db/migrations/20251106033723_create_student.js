
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  const isExist  = await knex.schema.hasTable("student");
  if(!isExist){
    return knex.schema.createTable("student",(table)=>{
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
        table.uuid("school_id").notNullable().references("id").inTable("school").onDelete("CASCADE");
        table.uuid("course_id").notNullable().references("id").inTable("school_course").onDelete("CASCADE");
        table.uuid("batch_id").notNullable().references("id").inTable("batch_course").onDelete("CASCADE");
        table.enum("status",["pending","active","suspend"]).defaultTo("pending");
        table.timestamp("completed_at");
        table.timestamps(true,true);

        table.unique(["user_id","course_id","school_id"]);
    })
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
    return knex.schema.dropTableIfExists("student");
};
