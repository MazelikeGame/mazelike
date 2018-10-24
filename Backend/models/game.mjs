import Sequelize from 'sequelize';
import sql from '../sequelize';
import Player from './player';

let Game = sql.define('games', {
  gameId: {
    type: Sequelize.STRING,
    allowNull: false
  },
});

Game.hasMany(Player, { as: 'Players' });

export default Game;
