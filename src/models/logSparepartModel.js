const { DataTypes } = require('sequelize')
const sequelize = require('../../connect')

const LogSparepartModel = sequelize.define('LogSparepartModel', {
    id_log_sparepart: {
        type: DataTypes.NUMBER,
        autoIncrement: true,
        primaryKey: true
    },
    tanggal: {
        type: DataTypes.DATE,
        autoIncrement: false,
    },
    kode_sparepart: {
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
    stok_awal: {
        type: DataTypes.INTEGER,
        autoIncrement: false,
        allowNull: false
    },
    nilai_awal: {
        type: DataTypes.DOUBLE,
        autoIncrement: false,
        allowNull: false
    },
    stok_masuk: {
        type: DataTypes.INTEGER,
        autoIncrement: false,
        allowNull: false
    },
    nilai_masuk: {
        type: DataTypes.DOUBLE,
        autoIncrement: false,
        allowNull: false
    },
    stok_keluar: {
        type: DataTypes.INTEGER,
        autoIncrement: false,
        allowNull: false
    },
    nilai_keluar: {
        type: DataTypes.DOUBLE,
        autoIncrement: false,
        allowNull: false
    },
    stok_akhir: {
        type: DataTypes.INTEGER,
        autoIncrement: false,
        allowNull: false
    },
    nilai_akhir: {
        type: DataTypes.DOUBLE,
        autoIncrement: false,
        allowNull: false
    },
    
},
{
    tableName: 'log_sparepart',
    timestamps: false
})

module.exports = LogSparepartModel