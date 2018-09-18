import Sequelize from 'sequelize';

// You can call this with or without new it should work either way
export default function User(sequelize) {
  let user = sequelize.define('users', {
    username: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING
  });

  // add methods here as user.method = function() {}
  // do not use an => if you want to use this in the function

  return user;
}