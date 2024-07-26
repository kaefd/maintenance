const { DataTypes } = require('sequelize')
const sequelize = require('../../connect')

const KategoriPenanganan = sequelize.define('KategoriPenanganan', {
    id_kategori_pgn: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nama_penanganan: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false,
    },
},
{
    tableName: 'kategori_penanganan',
    timestamps: false
})

module.exports = KategoriPenanganan