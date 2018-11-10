import Sequelize from 'sequelize';
import sql from '../sequelize';
import Lobby from './lobby';

let Player = sql.define('players', {
  spriteName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  numFloor: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  inGame: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  x: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  y: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  hp: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

Player.hasOne(Lobby, { foreignKey: 'player', targetKey: 'lobbyId' });

Player.getRandomSprite = () => {
  let playerSprites = ['player1', 'player2', 'player3', 'player4'];
  return playerSprites[Math.floor(Math.random() * playerSprites.length)];
};

/**
 * The player model. Has one to many relationship with the User model.
 * Has one to one relationship with the Lobby model.
 * @param {String} spriteName - Name of the sprite used for this player.
 * @param {Integer} numFloor - The floorId the player is on.
 */
export default Player;
