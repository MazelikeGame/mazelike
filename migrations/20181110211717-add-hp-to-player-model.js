'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'players',
      'hp',
      {
        type: Sequelize.INTEGER
      }
    );
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('players', 'hp');
  }
};
