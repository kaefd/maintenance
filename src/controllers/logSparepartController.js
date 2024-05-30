const { Op, where } = require('sequelize')
const { validationResult } = require('express-validator');
const LogSparepart = require('../models/logSparepartModel')

// GET ALL LOG SPAREPART
const getAll = async (req, res) => {
	const page = req.query.page || 1
	const limit = req.query.limit || 10
	const offset = (page - 1) * limit;
    
    try {
		let whereCondition = Object.fromEntries(
			Object.entries(req.query).filter(([key, value]) => key != "limit" && key != "page")
		);
        const logSparepart = await LogSparepart.findAll({
            limit: parseInt(limit),
			offset: parseInt(offset),
			where: whereCondition
        })
        const total = await LogSparepart.findAll({ where: whereCondition })
        var re = page > 1 ? total.length - (page * limit - limit) -  logSparepart.length : total.length - logSparepart.length
        res.status(200).json({
			status: "success",
			code: 200,
			page: req.query.page ? parseInt(page) : 1,
			limit: req.query.limit ? parseInt(limit) : total.length,
			rows: req.query.limit ? logSparepart.length : total.length,
			totalData: total.length,
			remainder: req.query.limit ? re : 0,
			data: req.query.limit ? logSparepart : total,
		});
    } catch (error) {
        res.status(500).json({
			status: "error",
			code: 500,
			message: error|| ["Internal server error"],
		});
    }
}
const getSearch = async (req, res) => {
	const input = req.query.search
	try {
		let logsp = await LogSparepart.findAll()
		if (!logsp) return res.status(404).json({
			status: "error",
			code: 404,
			message: ["data tidak ditemukan"]
		});
		let nwlogsp = logsp.map(i => i.dataValues)
		const search = input ? nwlogsp.filter(item => Object.values(item).some(value => typeof value == 'string' && value.toLowerCase().includes(input.toLowerCase()))) : logsp
		// RESPONSE
		res.status(200).json({
			status: "success",
			code: 200,
			page: 1,
			limit: parseInt(search.length),
			rows: search.length,
			totalData: search.length,
			remainder: 0,
			data: search,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: error|| ["Internal server error"],
		});
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
    getSearch,
    createLog,
}