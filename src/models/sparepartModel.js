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
        allowNull: false,
    },
    tipe: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false
    },
    satuan: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false
    },
    harga_beli: {
        type: DataTypes.DOUBLE,
        autoIncrement: false,
        allowNull: false
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