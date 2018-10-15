'use strict';
module.exports = (sequelize, DataTypes) => {
  const Lobby = sequelize.define('Lobby', {
    lobbyId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isHost: {
      type: DataTypes.STRING,
      allowNull: false
    },
    playerId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    secret: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});
  Lobby.associate = function(models) {
    // associations can be defined here
  };
  return Lobby;
};
