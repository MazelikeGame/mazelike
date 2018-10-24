import Sequelize from 'sequelize';
import sql from '../sequelize';
import User from './user';

let Player = sql.define('players', {
  uuid: {
    type: Sequelize.UUID,
    primaryKey: true
  },
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

/**
 * The player model. Has one to many relationship with the User model.
 * @param {UUID} uuid - The primary key.
 * @param {Integer} numPlayer - Every game can have up to 4 players.
 * This refers to which of the 4 players this player is
 * @param {String} items - The list of all items the player has.
 * @param {Integer} floor - The floor number the player is on
 */
export default Player;
