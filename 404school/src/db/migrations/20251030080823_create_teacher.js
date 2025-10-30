
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  const isExist = await knex.schema.hasTable("teacher")
  if(!isExist){
    return knex.schema.createTable("teacher",table=>{
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"))
        table.uuid("teacher_id").references("id").inTable("users").onDelete("CASCADE");
        table.uuid("school_id").references("id").inTable("school").onDelete("CASCADE");
        table.jsonb("qualification").defaultTo("{}");
        table.enum("status",["pending","active","suspend"]).defaultTo("pending")
        table.timestamps(true,true);

        table.unique(["teacher_id","school_id"]);
    })
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  return knex.schema.dropTableIfExists("teacher")
};
