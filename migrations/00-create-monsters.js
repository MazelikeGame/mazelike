'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('monsters', {
      floorId: Sequelize.STRING,
      x: Sequelize.INTEGER,
      y: Sequelize.INTEGER,
      hp: Sequelize.INTEGER,
      type: Sequelize.STRING,
      name: Sequelize.STRING,
      id: {
        primaryKey: true,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('monsters');
  }
};