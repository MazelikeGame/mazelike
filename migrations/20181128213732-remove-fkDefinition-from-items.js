'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.removeColumn('items', 'fkDefinition');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'items',
      'fkDefinition',
      {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    );
  }
};
