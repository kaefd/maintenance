const { Op, where } = require('sequelize')
const { validationResult } = require('express-validator');
const LogMesin = require('../models/logMesinModel');
const Mesin = require('../models/mesinModel');

// GET ALL LOG
const getAll = async (req, res) => {

	// MODEL ASSOSIATION
	Mesin.hasMany(LogMesin, {foreignKey: 'kode_mesin'})
	LogMesin.belongsTo(Mesin, {foreignKey: 'kode_mesin'})


	const page = req.query.page || 1
	const limit = req.query.limit || 10
	const offset = (page - 1) * limit;
    
    try {
		let whereCondition = Object.fromEntries(
			Object.entries(req.query).filter(([key, value]) => key != "limit" && key != "page")
		);
        const logMesin = await LogMesin.findAll({
            limit: parseInt(limit),
			offset: parseInt(offset),
			where: whereCondition,
			include: [
				{
                	model: Mesin,
                	required: true,
                	attributes: ['nama_mesin']
            	}
			]
        })
        const total = await LogMesin.findAll({ where: whereCondition })
        var re = page > 1 ? total.length - (page * limit - limit) -  logMesin.length : total.length - logMesin.length

		// new object
		const _log = logMesin.map(m => {
			return {
				tanggal: m.tanggal,
				kode_mesin: m.kode_mesin,
				nama_mesin: m.Mesin.nama_mesin,
				kategori: m.kategori,
				keterangan: m.keterangan,
				user_input: m.user_input,
			}
		})

        res.status(200).json({
			status: "success",
			code: 200,
			page: req.query.page ? parseInt(page) : 1,
			limit: req.query.limit ? parseInt(limit) : total.length,
			rows: req.query.limit ? _log.length : total.length,
			totalData: total.length,
			remainder: req.query.limit ? re : 0,
			data: req.query.limit ? _log : total,
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
	// MODEL ASSOSIATION
	Mesin.hasMany(LogMesin, {foreignKey: 'kode_mesin'})
	LogMesin.belongsTo(Mesin, {foreignKey: 'kode_mesin'})

	const input = req.query.search
	try {
		let logmesin = await LogMesin.findAll({
			include: [
				{
                	model: Mesin,
                	required: true,
                	attributes: ['nama_mesin']
            	}
			]
		})
		if (!logmesin) return res.status(404).json({
			status: "error",
			code: 404,
			message: ["data tidak ditemukan"]
		});
		// let nwlogmesin = logmesin.map(i => i.dataValues)
		
		// new object
		const _log = logmesin.map(m => {
			return {
				tanggal: m.tanggal,
				kode_mesin: m.kode_mesin,
				nama_mesin: m.Mesin.nama_mesin,
				kategori: m.kategori,
				keterangan: m.keterangan,
				user_input: m.user_input,
			}
		})

		const search = input ? _log.filter(item => Object.values(item).some(value => typeof value == 'string' && value.toLowerCase().includes(input.toLowerCase()))) : _log
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
const createLog = async (kode_mesin, kategori, keterangan, user_input, transaction) => {
    try {
        const tanggal = new Date().toISOString()
        await LogMesin.create({
            tanggal,
            kode_mesin,
            kategori,
            keterangan,
            user_input
        }, { transaction: transaction })
        return true
    } catch (error) {
        return { error: "Stok Error" }
    }
}
// DELETE LOG
const deleteLog = async(kode_mesin, kategori, keterangan, transaction) => {
	try {
		await LogMesin.destroy({
			where: {
				kode_mesin: kode_mesin,
				kategori: kategori,
				keterangan: keterangan
			}
		}, { transaction: transaction })
		return true
	} catch(er) {
		return {error: err}
	}
}
module.exports = {
    getAll,
    getSearch,
    createLog,
	deleteLog
}