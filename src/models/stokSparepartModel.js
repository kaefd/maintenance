const { DataTypes } = require('sequelize')
const sequelize = require('../../connect')

const StokSparepartModel = sequelize.define('StokSparepartModel', {
    kode_sparepart: {
        type: DataTypes.STRING,
        primaryKey: true,
        autoIncrement: false,
        allowNull: false,
    },
    stok_akhir: {
        type: DataTypes.DOUBLE,
        autoIncrement: false,
        allowNull: false
    },
    
},
{
    tableName: 'stok_sparepart',
    timestamps: false
})

module.exports = StokSparepartModel