import Sequelize from 'sequelize';
import sql from '../sequelize';

let Item = sql.define('items', {
  floorId: {
    type: Sequelize.STRING,
    allowNull: true
  },
  x: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  y: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  spriteName: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

export default Item;
