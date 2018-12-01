'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.dropTable('itemDefinitions'),
    ];
  },

  down: (queryInterface) =>  {
    return queryInterface.addColumn('items', 'fkDefinition');
  }
};
