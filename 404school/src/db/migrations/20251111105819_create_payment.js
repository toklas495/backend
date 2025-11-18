
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  const isExist = await knex.schema.hasTable("payments");
  if(!isExist){
        return knex.schema.createTable("payments",(table)=>{
            table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
            table.uuid("order_id").notNullable().references("id").inTable("orders").onDelete("CASCADE");
            table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
            table.string("payment_gateway",50).defaultTo("razorpay")
            table.string("gateway_order_id");
            table.string("gateway_payment_id");
            table.string("gateway_signature");
            table.decimal("amount",10,2).notNullable();
            table.string("currency",3).defaultTo("INR");
            table.string("payment_method",50);
            table.enum("status",["pending","success","failed"]).defaultTo("pending");
            table.text("failure_reason");
            table.jsonb("gateway_response");
            table.timestamp("paid_at");
            table.timestamps(true,true);

            table.index(["order_id"]);
            table.index(["gateway_payment_id"]);
        })
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  return knex.schema.dropTableIfExists("payments");
};
