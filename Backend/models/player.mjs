import Sequelize from 'sequelize';
import sql from '../sequelize';
import User from './user';

let Player = sql.define('players', {
  numPlayer: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  items: {
    type: Sequelize.STRING,
    allowNull: true
  },
  floor: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

Player.belongsTo(User, { as: 'Username' });

export default Player;
