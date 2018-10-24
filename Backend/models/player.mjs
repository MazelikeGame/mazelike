import Sequelize from 'sequelize';
import sql from '../sequelize';
import User from './user';

let Player = sql.define('players', {
  uuid: {
    type: Sequelize.UUID,
    primaryKey: true
  },
  spriteName: {
    type: Sequelize.String,
    allowNull: false
  },
  floorId: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

Player.belongsTo(User, { foreignKey: 'uuid', sourceKey: 'username' });
// Player.belongsToMany(Item,{ as: 'Items', through: 'PlayerItems', foreignKey: 'itemId' });

/**
 * The player model. Has one to many relationship with the User model.
 * @param {UUID} uuid - The primary key.
 * @param {username} - Foreign key to user model. One to Many relationship
 * // not entirely sure on this one, will have to check
 * @param {String} items - Foreign key to item model. Many to Many relationship
 * @param {Integer} floorId - The floorId the player is on
 */
export default Player;
