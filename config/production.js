/* Enable with `export NODE_ENV=production` */

"use strict";

module.exports = {
  domain: "api.database.cric.com.br",
  origin: "http://api.database.cric.com.br", /* for CORS */
  database: {
    host: "db",
    username: "root",
    password: "123.456",
    database: "cric",
    dialect: "mysql",
    timezone: "-03:00",
    define: {
      charset: "utf8",
      collate: "utf8_general_ci",
      underscored: true,
      timestamps: true
    },
    pool: {
      max: 5,
      idle: 30000,
      acquire: 60000
    },
    logging: false
  }
};
