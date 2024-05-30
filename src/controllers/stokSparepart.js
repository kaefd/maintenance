const { Op } = require('sequelize')
const { validationResult } = require('express-validator');
const StokSparepartModel = require('../models/stokSparepartModel');
const Sparepart = require('../models/sparepartModel');

// GET ALL LOG SPAREPART
const getAll = async (req, res) => {
	// MODEL ASSOSIATION
	Sparepart.hasMany(StokSparepartModel, {foreignKey: 'kode_sparepart'})
	StokSparepartModel.belongsTo(Sparepart, {foreignKey: 'kode_sparepart'})

    const { limit = 10, page = 1 } = req.query;
	const offset = (page - 1) * limit;
    
    try {
        let stokSparepart = await StokSparepartModel.findAll({
            limit: parseInt(limit),
			offset: parseInt(offset),
			include: [{
				model: Sparepart,
                required: true,
                attributes: ['nama_sparepart']
			}]
        })
		let newData = stokSparepart.map((s) => {
			return {
				kode_sparepart: s.kode_sparepart,
				nama_sparepart: s.Sparepart.nama_sparepart,
				stok_akhir: s.stok_akhir
			}
		})
        const total = await StokSparepartModel.findAll()
        var re = page > 1 ? total.length - (page * limit - limit) -  newData.length : total.length - newData.length
        res.status(200).json({
			status: "success",
			code: 200,
			page: parseInt(page),
			limit: parseInt(limit),
			rows: newData.length,
			totalData: total.length,
			remainder: re || 0,
			data: newData.filter((f) => f.stok_akhir != 0),
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
		let stok = await StokSparepartModel.findAll()
		if (!stok) return res.status(404).json({
			status: "error",
			code: 404,
			message: ["data tidak ditemukan"]
		});
		let nwstok = stok.map(i => i.dataValues)
		const search = input ? nwstok.filter(item => Object.values(item).some(value => typeof value == 'string' && value.toLowerCase().includes(input.toLowerCase()))) : stok
		// RESPONSE
		res.status(200).json({
			status: "success",
			code: 200,
			page: 1,
			limit: parseInt(search.length),
			rows: search.length,
			totalData: search.length,
			remainder: 0,
			data: search.filter((f) => f.stok_akhir != 0),
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: error|| ["Internal server error"],
		});
	}
}
// CREATE
const updateStok = async (kode_sparepart, stok_akhir, transaction) => {
    try {
        // cek stok sparepart
        let stok = await StokSparepartModel.findOne({ where: { kode_sparepart: kode_sparepart }})
        if(!stok) {
            await StokSparepartModel.create({
                kode_sparepart,
                stok_akhir
            }, { transaction: transaction })
        } else {
            let updt = await stok.update({
                kode_sparepart: stok.kode_sparepart,
                stok_akhir: stok_akhir
            })
            updt.save()
        }
        return true
    } catch (error) {
        return { error: "Stok Error" }
    }
}
module.exports = {
    getAll,
    getSearch,
    updateStok,
}