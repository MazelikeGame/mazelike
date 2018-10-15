const bycrypt = require('bcrypt');

'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      DataTypes.STRING,
      allowNull: false
    },
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    image_name: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };

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


  // add methods here as user.method = function() {};
  // do not use an => if you want to use this in the function
  return User;
};
