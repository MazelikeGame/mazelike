import Sequelize from 'sequelize';
import sql from '../sequelize';
import Player from './player';

let Game = sql.define('games', {
  gameId: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false
  },
});

Game.hasMany(Player, { as: 'Players' });

/**
 * The game model. Has many to many relationship with the Player model.
 * Instances of Game will get the accessors `getPlayers` and `setPlayers`.
 * @param {Integer} gameId - The unique game id. The same name as the json file
 * in public
 * @param {Player[]} Players - Foreign key, many to many relationship
 * with the Player model.
 */
export default Game;
