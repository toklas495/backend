
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  const isExist = await knex.schema.hasTable("school_course");
  if(!isExist){
    return knex.schema.createTable("school_course",table=>{
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("school_id").notNullable().references("id").inTable("school").onDelete("CASCADE")
        table.uuid("course_id").notNullable().references("id").inTable("course").onDelete("CASCADE");
        table.string("name",100).notNullable();
        table.text('description')
        table.float("amount").defaultTo(0.00);
        table.boolean("is_active").defaultTo(false);
        table.timestamps(true,true);
        table.unique(["school_id","course_id"]);
    })
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  return knex.schema.dropTableIfExists("school_course");
};
