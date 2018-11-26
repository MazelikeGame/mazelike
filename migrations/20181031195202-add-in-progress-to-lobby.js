'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'lobbies',
        'inProgress',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }
      )
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('lobbies', 'inProgress')
    ]);
  }
};
