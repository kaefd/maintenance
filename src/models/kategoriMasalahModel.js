const { DataTypes } = require('sequelize')
const sequelize = require('../../connect')

const KategoriMasalah = sequelize.define('KategoriMasalah', {
    id_kategori: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nama_kategori: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false,
    },
},
{
    tableName: 'kategori_masalah',
    timestamps: false
})

module.exports = KategoriMasalah