'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'players', // name of target model
      'username', // name of the key we are adding
      {
        type: Sequelize.UUID,
        references: {
          model: 'users', // name of source model
          key: 'id' // key in source model that is being referenced
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'players', // name of target model
      'username' // name of the key to remove
    );
  }
};
