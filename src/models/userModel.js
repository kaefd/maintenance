const { DataTypes } = require('sequelize')
const sequelize = require('../../connect')
const RoleModel = require('./RoleModel')

const UserModel = sequelize.define('UserModel', {
    username: {
        type: DataTypes.STRING,
        autoIncrement: false,
        primaryKey: true
    },
    password: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false,
    },
    role_id: {
        type: DataTypes.INTEGER,
        autoIncrement: false,
        allowNull: false,
    },
    created_by: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false
    },
    created_date: {
        type: DataTypes.DATE,
        autoIncrement: false,
        allowNull: false
    },
    deleted_by: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: true,
    },
    deleted_date: {
        type: DataTypes.DATE,
        autoIncrement: false,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false
    },
},
{
    tableName: 'data_user',
    timestamps: false
})

module.exports = UserModel