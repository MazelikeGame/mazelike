import Sequelize from 'sequelize';
import sequelize from '../sequelize';

// You can call this with or without new it should work either way
let User = sequelize.define('users', {
  username: Sequelize.STRING,
  email: Sequelize.STRING,
  password: Sequelize.STRING
});

// add methods here as user.method = function() {}
// do not use an => if you want to use this in the function
export default User;
