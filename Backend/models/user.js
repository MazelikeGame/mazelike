var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

var sequelize = new Sequelize('mysql://root@mysql:3306/auth-system');

var User = sequelize.define('users', {
    username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    hooks: {
        beforeCreate: (user) => {
            const salt = bcrypt.genSaltSync();
            user.passowrd = bcrypt.hashSync(user.password, salt);
        }
    },
    instanceMethods: {
        validPassword: function(password) {
            return bcrypt.compareSync(password, this.password);
        }
    }
});

sequelize.sync()
    .then(() => {
        console.log('users table has been successfully created, if one doesn\'t exist')
    })
    .catch((error) => {
        console.log('This error occured', error)
    });

module.exports = User;
