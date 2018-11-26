import Sequelize from 'sequelize';
import sql from '../sequelize';
import bcrypt from 'bcryptjs';
import Player from './player';
/**
 * Represents a users.
 * @constructor
 */
let User = sql.define('users', {
  username: Sequelize.STRING,
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  image_name: Sequelize.STRING,
  resetPasswordToken: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null
  },
  resetPasswordExpires: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null
  }
});

User.hasMany(Player, { foreignKey: 'username' });


// add methods here as user.method = function() {};
// do not use an => if you want to use this in the function

/**
 * Encrypts the users password.
 * @param {string} password the given password to encrypt.
 */
User.encryptPassword = function(password, callback) {
  bcrypt.hash(password, 10, function(err, hash) {
    callback(err, hash);
  });
};

/**
 * Compares the password.
 * @param {string} password the given password to compare.
 * @param {string} realPassword the encrypted password from the database.
 */
User.comparePassword = function(password, realPassword, callback) {
  bcrypt.compare(password, realPassword, function(err, result) {
    callback(err, result);
  });
};
export default User;
