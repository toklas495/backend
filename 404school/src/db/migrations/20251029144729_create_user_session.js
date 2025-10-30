
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  const isExist = await knex.schema.hasTable("user_sessions");
  if(!isExist){
    return knex.schema.createTable("user_sessions",table=>{
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
        table.text("session_token").notNullable();
        table.text("refresh_token").notNullable();
        table.timestamp("expires_at").notNullable();
        table.boolean("is_deleted").defaultTo(false);
        table.timestamps(true,true);
    })
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  return knex.schema.dropTableIfExists("user_sessions");
};
