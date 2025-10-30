
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  const isExist = (await knex.schema.hasTable("users"));
  if(!isExist){
    return knex.schema.createTable("users",table=>{
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"))
        table.string("username").notNullable();
        table.string("full_name").notNullable();
        table.string("email").unique().notNullable();
        table.string("password").notNullable();
        table.string("phone").defaultTo("999999999")
        table.string("profile_url").defaultTo("");
        table.enum("role",["admin","student","teacher","principal","guardian"])
        table.boolean("is_active").defaultTo(false);
        table.boolean("verified").defaultTo(false);
        table.timestamps(true,true);
    })
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  return knex.schema.dropTableIfExists("users");
}