import Sequelize from "sequelize";
import sql from "../sequelize";

let Maps = sql.define("maps", {
  floorId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  map: {
    type: Sequelize.JSON,
    allowNull: false
  }
});

export default Maps;
