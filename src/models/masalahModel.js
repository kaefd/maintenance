const { DataTypes } = require('sequelize')
const sequelize = require('../../connect')

const Masalah = sequelize.define('Masalah', {
    no_masalah: {
        type: DataTypes.STRING,
        autoIncrement: false,
        primaryKey: true
    },
    nama_kategori: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false,
    },
    tgl_masalah: {
        type: DataTypes.DATEONLY,
        autoIncrement: false,
        allowNull: false,
    },
    kode_mesin: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: true,
    },
    keterangan_masalah: {
        type: DataTypes.TEXT,
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
    finish_by: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false
    },
    finish_date: {
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
    tableName: 'masalah',
    timestamps: false
})

module.exports = Masalah