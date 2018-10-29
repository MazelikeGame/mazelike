import Sequelize from 'sequelize';
import sql from '../sequelize';
import bcrypt from 'bcrypt';

// You can call this with or without new it should work either way
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


// add methods here as user.method = function() {};
// do not use an => if you want to use this in the function
User.encryptPassword = function(password, callback) {
  bcrypt.hash(password, 10, function(err, hash) {
    callback(err, hash);
  });
};

User.comparePassword = function(password, realPassword, callback) {
  bcrypt.compare(password, realPassword, function(err, result) {
    callback(err, result);
  });
};
export default User;
