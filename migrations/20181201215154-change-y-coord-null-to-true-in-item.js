'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn(
      'items',
      'y',
      {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn(
      'items',
      'y',
      {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    );
  }
};
