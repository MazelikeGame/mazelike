'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'itemDefinitions',
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
        movementSpeed: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        attackSpeed: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        attack: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        defence: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        range: {
          type: Sequelize.INTEGER,
          allowNull: true
        }
      }
    );
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('itemDefinitions');
  }
};
