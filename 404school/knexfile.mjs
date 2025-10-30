// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
import env_constant from "./env.config.mjs";

const config = {

  development: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'postgres',
      password: 'postgres',
      host:"0.0.0.0",
      port:5432
    },
    migrations:{
      directory:"./src/db/migrations"
    },
    pool:{
      min:2,
      max:10
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: env_constant.db.name,
      user:     env_constant.db.user,
      password: env_constant.db.pass,
      port:env_constant.db.port,
      host:env_constant.db.host
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory:"./src/db/migrations"
    }
  }

};


export default config;