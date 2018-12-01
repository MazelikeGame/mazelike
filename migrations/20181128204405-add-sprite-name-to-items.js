'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'items',
      'spriteName',
      {
        type: Sequelize.STRING,
        allowNull: true
      }
    );
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('items', 'spriteName');
  }
};
