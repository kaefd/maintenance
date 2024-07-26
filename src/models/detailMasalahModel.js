const { DataTypes } = require('sequelize')
const sequelize = require('../../connect')

const PenangananDetail = sequelize.define('PenangananDetail', {
    no_penanganan: {
        type: DataTypes.STRING,
        autoIncrement: false,
        primaryKey: true
    },
    no_urut: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: true,
    },
    kode_sparepart: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: true,
    },
    jumlah: {
        type: DataTypes.INTEGER,
        autoIncrement: false,
        allowNull: true,
    },
    nilai: {
        type: DataTypes.DOUBLE,
        autoIncrement: false,
        allowNull: true,
    },
    keterangan: {
        type: DataTypes.TEXT,
        autoIncrement: false,
        allowNull: true,
    },
},
{
    tableName: 'penanganan_detail',
    timestamps: false
})

module.exports = PenangananDetail