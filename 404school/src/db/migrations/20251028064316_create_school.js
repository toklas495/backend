
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  const isExist = await knex.schema.hasTable("school");
  if(!isExist){
    return knex.schema.createTable("school",table=>{
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("principal_id").references("id").inTable("users").onDelete("CASCADE");
        table.string("name").unique().notNullable();
        table.text("address").defaultTo('')
        table.string("phone");
        table.string("email");
        table.enum("status",["pending","active","suspended"]).defaultTo("pending");
        table.string("logo_uri");
        table.timestamps(true,true);
    })
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  return knex.schema.dropTableIfExists("school");
};
