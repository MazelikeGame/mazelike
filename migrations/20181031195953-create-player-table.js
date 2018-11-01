'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.createTable(
        'players',
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
          spriteName: {
            type: Sequelize.STRING,
            allowNull: false
          },
          numFloor: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
          },
          username: {
            type: Sequelize.STRING
          }
        }
      ),
    ];
  },

  down: (queryInterface, Sequelize) => {
    return [
      queryInterface.dropTable('players')
    ];
  }
};
