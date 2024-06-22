const { DataTypes } = require('sequelize')
const sequelize = require('../../connect')

const Sparepart = sequelize.define('Sparepart', {
    kode_sparepart: {
        type: DataTypes.STRING,
        autoIncrement: false,
        primaryKey: true
    },
    nama_sparepart: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false,
    },
    merk: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: true,
    },
    tipe: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: true
    },
    satuan: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: true
    },
    harga_beli: {
        type: DataTypes.DOUBLE,
        autoIncrement: false,
        allowNull: true
    },
    stok_minus: {
        type: DataTypes.NUMBER,
        autoIncrement: false,
        allowNull: true
    },
    stok_akhir: {
        type: DataTypes.NUMBER,
        autoIncrement: false,
        allowNull: true
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
    tableName: 'data_sparepart',
    timestamps: false
})

module.exports = Sparepart