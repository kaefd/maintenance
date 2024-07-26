const { DataTypes } = require('sequelize')
const sequelize = require('../../connect')

const Penanganan = sequelize.define('Penanganan', {
    no_penanganan: {
        type: DataTypes.STRING,
        autoIncrement: false,
        primaryKey: true
    },
    no_masalah: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false,
    },
    tgl_penanganan: {
        type: DataTypes.DATE,
        autoIncrement: false,
        allowNull: false,
    },
    nama_penanganan: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false,
    },
    total_nilai: {
        type: DataTypes.DOUBLE,
        autoIncrement: false,
        allowNull: true,
    },
    user_input: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        autoIncrement: false,
        allowNull: false
    },
},
{
    tableName: 'penanganan',
    timestamps: false
})

module.exports = Penanganan