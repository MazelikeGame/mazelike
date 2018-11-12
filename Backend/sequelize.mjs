import Sequelize from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

const sql = new Sequelize({
  database: process.env.DB_DATABASE,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_STORAGE ? "sqlite" : 'mysql',
  operatorsAliases: false,
  storage: process.env.DB_STORAGE,
  // eslint-disable-next-line
  logging: process.env.DB_DEBUG !== "no" ? console.log : false
});

export default sql;
