const { DataTypes } = require('sequelize')
const sequelize = require('../../connect')

const LogMesin = sequelize.define('LogMesin', {
    id: {
        type: DataTypes.NUMBER,
        primaryKey: true
    },
    tanggal: {
        type: DataTypes.DATE,
        autoIncrement: false,
    },
    kode_mesin: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false,
    },
    kategori: {
        type: DataTypes.TEXT,
        autoIncrement: false,
        allowNull: false,
    },
    keterangan: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false
    },
    user_input: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false
    },
},
{
    tableName: 'log_mesin',
    timestamps: false
})

module.exports = LogMesin