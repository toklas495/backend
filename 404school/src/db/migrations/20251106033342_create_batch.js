
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  const isExist = await knex.schema.hasTable("batch_course");
  if(!isExist){
    return knex.schema.createTable("batch_course",(table)=>{
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("school_id").notNullable().references("id").inTable("school").onDelete("CASCADE");
        table.uuid("teacher_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
        table.uuid("course_id").notNullable().references("id").inTable("school_course").onDelete("CASCADE");
        table.string("name").notNullable(); // Example: "Morning Batch", "Batch A"
        table.string("timing").nullable();  // Example: "10:00 AM - 12:00 PM"
        table.date("start_date").notNullable();
        table.date("end_date").nullable();
        table.text("plan").nullable();
        table.integer("capacity").defaultTo(100);
        table.timestamps(true,true);
    })
  }     
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  return knex.schema.dropTableIfExists("batch_course");
};
