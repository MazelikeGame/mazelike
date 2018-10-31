'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.createTable(
        'players',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          createdAt: {
            type: Sequelize.DATE
          },
          updatedAt: {
            type: Sequelize.DATE
          },
          spriteName: {
            type: Sequelize.STRING,
            allowNull: false
          },
          numFloor: {
            type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: false
          }
        }
      ),
      queryInterface.addColumn(
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
      ),
    ];
  },

  down: (queryInterface, Sequelize) => {
    return [
      queryInterface.removeColumn(
        'players', // name of target model
        'username' // name of the key to remove
      ),
      queryInterface.dropTable('players')
    ];
  }
};
