import Sequelize from 'sequelize';
import sql from '../sequelize';
import User from './user';

let Player = sql.define('players', {
  spriteName: {
    type: Sequelize.STRING,
    allowNull: false
  },
});


// Player.associate = function(models) {
//   models.Player.belongsTo(models.User, { foreignKey: 'name' });
// };
Player.hasOne(User, { foreignKey: 'player' });

/**
 * The player model. Has one to many relationship with the User model.
 * @param {String} name - Foreign key to the field 'username' in the user model. One to Many relationship
 * // not entirely sure on this one, will have to check
 * @param {String} items - Foreign key to item model. Many to Many relationship
 * @param {Integer} floorId - The floorId the player is on. This id also includes the gameId.
 */
export default Player;
