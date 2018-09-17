import Sequelize from 'sequelize';

export class User {
  constructor(sequelize) {
    return sequelize.define('users', {
      username: Sequelize.STRING,
      email: Sequelize.STRING,
      password: Sequelize.STRING
    });
  }
}