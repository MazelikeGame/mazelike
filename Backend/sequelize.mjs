import Sequelize from "sequelize";
import config from "../config/config";

const sql = new Sequelize(config.production);

export default sql;
