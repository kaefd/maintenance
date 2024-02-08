const { DataTypes } = require('sequelize')
const sequelize = require('../../connect')
const UserModel = require('./userModel')

const RoleModel = sequelize.define('RoleModel', {
    id_role: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nama_role: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false,
    },
},
{
    tableName: 'role',
    timestamps: false
})

module.exports = RoleModel