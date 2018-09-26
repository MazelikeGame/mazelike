import Sequelize from 'sequelize';
import bcrypt from 'bcrypt';

// You can call this with or without new it should work either way
export default function User(sequelize) {
  let user = sequelize.define('users', {
    username: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING
  });

  user.encryptPassword = function(password, callback) {
    bcrypt.hash(password, 10, function(err, hash) {
      callback(err, hash);
    });
  };

  user.comparePassword = function(password, realPassword, callback) {
    bcrypt.compare(password, realPassword, function(err, result) {
      callback(err, result);
    });
  };

  // add methods here as user.method = function() {};
  // do not use an => if you want to use this in the function
  return user;
}
