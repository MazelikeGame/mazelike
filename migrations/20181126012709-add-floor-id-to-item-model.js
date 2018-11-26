'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'items',
      'floorId',
      {
        type: Sequelize.STRING
      }
    );
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('items', 'floorId');
  }
};
