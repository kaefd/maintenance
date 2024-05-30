const { Sequelize } = require('sequelize')

const sequelize = new Sequelize ({
    dialect: 'mysql',
    host: 'monorail.proxy.rlwy.net',
    username: 'root',
    password: 'bYhYkWIwcXItnZXbUThwIfKdeUbHNYZA',
    database: 'railway',
})

module.exports = sequelize