const { Sequelize } = require('sequelize')

const sequelize = new Sequelize ({
    dialect: 'mysql',
    host: "localhost",
    username: 'root',
    password: '',
    database: 'man_maintenance'
})

module.exports = sequelize