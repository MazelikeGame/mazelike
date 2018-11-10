'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'players',
      'hp',
      {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    );
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('players', 'hp');
  }
};
