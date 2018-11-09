'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn(
        'players',
        'x',
        {
          type: Sequelize.INTEGER,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'players',
        'y',
        {
          type: Sequelize.INTEGER,
          allowNull: true
        }
      )
    ];
  },

  down: (queryInterface) => {
    return [
      queryInterface.removeColumn('players', 'x'),
      queryInterface.removeColumn('players', 'y')
    ];
  }
};
