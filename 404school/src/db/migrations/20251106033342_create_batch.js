
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  const isExist = await knex.schema.hasTable("batch_course");
  if(!isExist){
    return knex.schema.createTable("batch_course",(table)=>{
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("course_id").notNullable().references("id").inTable("school_course").onDelete("CASCADE");
        table.string("batch_name",100).notNullable();
        table.enum("timing",["morning","afternoon","evening","weekend"]);
        table.date("start_date").notNullable();
        table.date("end_date");
        table.time("class_start_time");
        table.time("class_end_time");
        table.integer("max_student").defaultTo(30);
        table.enum("status",["upcoming","ongoing","completed","cancelled"]).defaultTo("upcoming");

        table.timestamps(true,true);

        table.index(["course_id","start_date"]);
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
