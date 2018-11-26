import Sequelize from 'sequelize';
import sql from '../sequelize';
import ItemDefinition from './itemDefinition';

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
});

Item.belongsTo(ItemDefinition, { foreignKey: 'fkDefinition' });

export default Item;
