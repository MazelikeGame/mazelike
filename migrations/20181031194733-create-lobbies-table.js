'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'lobbies',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        createdAt: {
          type: Sequelize.DATE
        },
        updatedAt: {
          type: Sequelize.DATE
        },
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
          allowNull: false
        },
        secret: {
          type: Sequelize.STRING,
          allowNull: false
        },
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('lobbies');
  }
};
