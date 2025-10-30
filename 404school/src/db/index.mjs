import knex from "knex";
import knexConfig from '../../knexfile.mjs';
import env_constant from "../../env.config.mjs";


const mode = env_constant.NODE_ENV;
const config = knexConfig[mode];
const db = knex(config);

// verify connection
(async () => {
    try {
        await db.raw("SELECT 1+1 AS result");
        console.log(`DATABASE CONNECTED ($env: ${mode})`)
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
})();

export async function closeDb(){
    console.log("🛑 Closing database connection...");
    await db.destroy();
    console.log("✅ Database connection closed.");
}


export default db;