import Sequelize from "sequelize";
import sql from "../sequelize";
import Player from './player';

let Lobby = sql.define("lobbies", {
  lobbyId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  isHost: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  playerId: {
    type: Sequelize.STRING,
  },
  secret: {
    type: Sequelize.STRING,
    allowNull: false
  },
  inProgress: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
});

Lobby.hasOne(Player, { foreignKey: 'player' });


export default Lobby;
