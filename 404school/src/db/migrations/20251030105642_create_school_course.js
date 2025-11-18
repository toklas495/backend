
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
        table.decimal("amount",10,2).notNullable().defaultTo(0.00);
        table.string("currency",3).defaultTo("INR");
        table.string("thumbnail_url")
        table.enum("level",["beginner","intermediate","advanced"]).defaultTo("biginner");
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
