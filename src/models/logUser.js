const { DataTypes } = require('sequelize')
const sequelize = require('../../connect')

const LogUser = sequelize.define('LogUser', {
    tanggal: {
        type: DataTypes.DATE,
        autoIncrement: false,
        primaryKey: true
    },
    kode_user: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false,
    },
    kategori: {
        type: DataTypes.INTEGER,
        autoIncrement: false,
        allowNull: false,
    },
    keterangan: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false
    },
    
},
{
    tableName: 'log_user',
    timestamps: false
})

module.exports = LogUser