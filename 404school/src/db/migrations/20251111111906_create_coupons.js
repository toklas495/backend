
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
    const isExist = await knex.schema.hasTable("coupons");
    if (!isExist) {
        return knex.schema.createTable("coupons", (table) => {
            table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
            table.string("code", 50).unique().notNullable();
            table.enum("discount_type", ["percentage", "fixed"]).notNullable();
            table.decimal("discount_value", 10, 2).notNullable();
            table.decimal("min_purchase_amount", 10, 2);
            table.decimal("max_discount_amount", 10, 2);
            table.integer("usage_limit");
            table.integer("used_count").defaultTo(0);
            table.date("valid_from");
            table.date("valid_until");
            table.boolean("is_active").defaultTo(true);
            table.timestamps(true, true);

            table.index(["code"]);
        })
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
    return knex.schema.dropTableIfExists("coupons");
};
