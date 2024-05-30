const { DataTypes } = require('sequelize')
const sequelize = require('../../connect')
const RoleModel = require('./RoleModel')

const PermissionModel = sequelize.define('PermissionModel', {
    id_permission: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
    },
    role_id: {
        type: DataTypes.INTEGER,
        autoIncrement: false,
        allowNull: false,
    },
    method: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    table: {
        type: DataTypes.STRING,
        allowNull: false,
    },
},
{
    tableName: 'role_permissions',
    timestamps: false
})

module.exports = PermissionModel