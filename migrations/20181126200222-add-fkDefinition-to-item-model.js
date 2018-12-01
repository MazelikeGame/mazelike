'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
    'items',
      'fkDefinition',
      {
        type: Sequelize.STRING
      }
    );
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('items', 'fkDefinition');
  }
};
