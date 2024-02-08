const { DataTypes } = require('sequelize')
const sequelize = require('../../connect')

const DetailMasalah = sequelize.define('DetailMasalah', {
    no_masalah: {
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
    keterangan: {
        type: DataTypes.TEXT,
        autoIncrement: false,
        allowNull: true,
    },
},
{
    tableName: 'detail_masalah',
    timestamps: false
})

module.exports = DetailMasalah