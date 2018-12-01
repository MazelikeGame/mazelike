'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.dropTable('itemDefinitions'),
      queryInterface.removeColumn('items', 'fkDefinition')
    ];
  },

  down: (queryInterface) =>  {
    return queryInterface.addColumn('items', 'fkDefinition');
  }
};
