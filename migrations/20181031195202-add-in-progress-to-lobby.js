'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return [
      queryInterface.addColumn(
        'lobbies',
        'inProgress',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }
      )
    ];
  },

  down: (queryInterface, Sequelize) => {
    return [
      queryInterface.removeColumn('lobbies', 'inProgress')
    ];
  }
};
