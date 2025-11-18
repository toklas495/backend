
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  const isExist = await knex.schema.hasTable("orders");
  if(!isExist){
    return knex.schema.createTable("orders",(table)=>{
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.string("order_number",50).unique().notNullable();
        table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
        table.uuid("course_id").notNullable().references("id").inTable("school_course").onDelete("CASCADE");
        table.uuid("batch_id").notNullable().references("id").inTable("batch_course").onDelete("CASCADE");
        table.decimal("amount",10,2).notNullable();
        table.decimal("discount",10,2).notNullable();
        table.decimal("tax",10,2).notNullable();
        table.decimal("total_amount",10,2).notNullable();
        table.string("currency",3).defaultTo("INR");
        table.enum("status",["pending","completed","failed","refunded","cancelled"]);
        table.string("coupon_code",50);
        table.timestamps(true,true);

        table.index(["user_id","status"]);
        table.index("order_number");
    })
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  return knex.schema.dropTableIfExists("orders");
};
