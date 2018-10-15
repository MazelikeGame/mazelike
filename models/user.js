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
  return User;
};
