const { Op } = require('sequelize')
const { validationResult } = require('express-validator');
const LogSparepart = require('../models/logSparepartModel')

// GET ALL LOG SPAREPART
const getAll = async (req, res) => {
    try {
        const logSparepart = await LogSparepart.findAll()
        res.json(logSparepart)
    } catch (error) {
        res.status(500).json({ error: error })
    }
}
// CREATE LOG
const createLog = async (kode_sparepart, kategori, keterangan, stok_awal, stok_masuk, stok_keluar, stok_akhir, transaction) => {
    try {
        const tanggal = new Date().toISOString()
        await LogSparepart.create({
            tanggal,
            kode_sparepart,
            kategori,
            keterangan,
            stok_awal,
            stok_masuk,
            stok_keluar,
            stok_akhir
        }, { transaction: transaction })
        return true
    } catch (error) {
        return { error: "Stok Error" }
    }
}
module.exports = {
    getAll,
    createLog,
}