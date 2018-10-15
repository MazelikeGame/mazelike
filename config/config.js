const dotenv = require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_STORAGE ? "sqlite" : 'mysql',
    storage: process.env.DB_STORAGE
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_STORAGE ? "sqlite" : 'mysql',
    storage: process.env.DB_STORAGE
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_STORAGE ? "sqlite" : 'mysql',
    storage: process.env.DB_STORAGE
  }
};
