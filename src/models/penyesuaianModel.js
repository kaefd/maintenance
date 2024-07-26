const { DataTypes } = require('sequelize')
const sequelize = require('../../connect')

const Penyesuaian = sequelize.define('Penyesuaian', {
    no_penyesuaian: {
        type: DataTypes.STRING,
        autoIncrement: false,
        primaryKey: true
    },
    tgl_penyesuaian: {
        type: DataTypes.DATEONLY,
        autoIncrement: false,
        allowNull: false,
    },
    kode_sparepart: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false,
    },
    kategori: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false,
    },
    keterangan: {
        type: DataTypes.TEXT,
        autoIncrement: false,
        allowNull: false
    },
    jumlah: {
        type: DataTypes.INTEGER,
        autoIncrement: false,
        allowNull: false
    },
    nilai: {
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
    tableName: 'penyesuaian_stok_sparepart',
    timestamps: false
})

module.exports = Penyesuaian