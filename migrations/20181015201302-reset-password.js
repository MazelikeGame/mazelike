'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'users',
        'resetPasswordToken',
        {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null
        }
      ),
      queryInterface.addColumn(
        'users',
        'resetPasswordExpires',
        {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null
        }
      )
    ]);
  },
  down: function(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('users', 'resetPasswordToken'),
      queryInterface.removeColumn('users', 'resetPasswordExpires')
    ]);
  }
};
