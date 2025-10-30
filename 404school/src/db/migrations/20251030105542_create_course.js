
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
    const isExist = await knex.schema.hasTable("course");
    if(!isExist){
        return knex.schema.createTable("course",table=>{
            table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
            table.string("code",20).unique().notNullable();
            table.string("name",100).notNullable();
            table.text("description");
            table.boolean("is_active").defaultTo(false);
            table.timestamps(true,true);
        })
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  return knex.schema.dropTableIfExists("course");
};
