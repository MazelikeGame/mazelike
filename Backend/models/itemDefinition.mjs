import Sequelize from 'sequelize';
import sql from '../sequelize';

let ItemDefinition = sql.define('itemDefinitions', {
  spriteName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  movementSpeed: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  attackSpeed: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  attack: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  defence: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  range: {
    type: Sequelize.INTEGER,
    allowNull: true
  }
});

export default ItemDefinition;
