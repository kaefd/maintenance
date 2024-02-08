const { DataTypes } = require('sequelize')
const sequelize = require('../../connect')

const Mesin = sequelize.define('Mesin', {
    kode_mesin: {
        type: DataTypes.STRING,
        autoIncrement: false,
        primaryKey: true
    },
    nama_mesin: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false,
    },
    keterangan: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: true,
    },
    tgl_beli: {
        type: DataTypes.DATEONLY,
        autoIncrement: false,
        allowNull: false
    },
    supplier: {
        type: DataTypes.STRING,
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
    tableName: 'data_mesin',
    timestamps: false
})

module.exports = Mesin