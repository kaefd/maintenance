const { DataTypes } = require('sequelize')
const sequelize = require('../../../connect')

const rolePermission = sequelize.define('rolePermission', {
    role_id: {
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false
    },
    method: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false,
    },
    table: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false,
    },
},
{
    tableName: 'role_permissions',
    timestamps: false
})

module.exports = rolePermission