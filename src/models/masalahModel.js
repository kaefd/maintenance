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
    penyebab: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false
    },
    keterangan_masalah: {
        type: DataTypes.TEXT,
        autoIncrement: false,
        allowNull: false
    },
    penanganan: {
        type: DataTypes.TEXT,
        autoIncrement: false,
        allowNull: true
    },
    tgl_penanganan: {
        type: DataTypes.DATE,
        autoIncrement: false,
        allowNull: true
    },
    total_biaya: {
        type: DataTypes.DOUBLE,
        autoIncrement: false,
        allowNull: true
    },
    created_by: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false
    },
    user_penanganan: {
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
    tableName: 'masalah_head',
    timestamps: false
})

module.exports = Masalah