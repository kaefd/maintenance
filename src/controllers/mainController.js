const { Op, where } = require("sequelize")
const { validationResult } = require("express-validator")
const { formaterPK } = require("../utils/utils")
const detailMasalah = require("./detailMasalahController")
const logUser = require("./logUserController")
const Masalah = require("../models/masalahModel")
const DetailMasalah = require("../models/masalahModel")
const sequelize = require("../../connect")
const Mesin = require("../models/mesinModel")
const KategoriMasalah = require("../models/kategoriMasalahModel")
const masalah = require("../modules/masalah_head")

// GET ALL
const getAll = async (req, res) => {
    let state = masalah
	// MODEL ASSOSIATION
    let assoc_model = state.config.assoc.model
    let rel = state.config.assoc.relation
    let model = state.config.model
    let fk = state.config.assoc.fk

	[assoc_model][rel[0]]([model], {foreignKey: fk})
	[model][rel[1]](model, {foreignKey: fk})

	const { limit = 10, page = 1 } = req.query;
	const offset = (page - 1) * limit;
	try {
		let whereCondition = Object.fromEntries(
			Object.entries(req.query).filter(([key, value]) => key != "limit" && key != "page")
		);
		whereCondition.status = ['open', 'close']
		let masalah = await Masalah.findAll({
			limit: parseInt(limit),
			offset: parseInt(offset),
			where: whereCondition,
			order: [["no_masalah", "DESC"]],
			include: [
				{
                	model: Mesin,
                	required: true,
                	attributes: ['nama_mesin']
            	}
			]
		});
		if (!masalah) {
			return res.status(404).json({
				status: "error",
				code: 404,
				message: ["data tidak ditemukan"]
			});
		}
		// new object
		const new_masalah = masalah.map(m => {
			return {
				no_masalah: m.no_masalah,
				nama_kategori: m.nama_kategori,
				tgl_masalah: m.tgl_masalah,
				kode_mesin: m.kode_mesin,
				nama_mesin: m.Mesin.nama_mesin,
				penyebab: m.penyebab,
				keterangan_masalah: m.keterangan_masalah,
				penanganan: m.penanganan,
				tgl_penanganan: m.tgl_penanganan,
				waktu_penanganan: m.waktu_penanganan,
				created_by: m.created_by,
				created_date: m.created_date,
				deleted_by: m.deleted_by,
				deleted_date: m.deleted_date,
				status: m.status,
			}
		})
		const total = await Masalah.findAll({
			where: whereCondition,
		})
		var re = page > 1 ? total.length - (page * limit - limit) -  new_masalah.length : total.length - new_masalah.length
		// RESPONSE
		res.status(200).json({
			status: "success",
			code: 200,
			page: parseInt(page),
			limit: parseInt(limit),
			rows: new_masalah.length,
			totalData: total.length,
			remainder: re >= 0 ? re : 0,
			data: new_masalah,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: error|| ["Internal server error"]
		});
	}
}
const getSearch = async (req, res) => {
	const input = req.query.search
	try {
		let masalah = await Masalah.findAll({
			where: {
				status: "true",
			},
			order: [["no_masalah", "DESC"]],
		})
		if (!masalah) return res.status(404).json({
			status: "error",
			code: 404,
			message: ["data tidak ditemukan"]
		});
		let nwmasalah = masalah.map(i => i.dataValues)
		const search = input ? nwmasalah.filter(item => Object.values(item).some(value => typeof value == 'string' && value.toLowerCase().includes(input.toLowerCase()))) : masalah
		console.log(search);
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
// GET
const getByKode = async (req, res) => {
	// MODEL ASSOSIATION
	Mesin.hasMany(Masalah, {foreignKey: 'kode_mesin'})
	Masalah.belongsTo(Mesin, {foreignKey: 'kode_mesin'})
	// PARAM
	const no_masalah = req.params.no_masalah;
	try {
		const masalah = await Masalah.findOne({
			where: {
				no_masalah: no_masalah
			},
			include: [
				{
            	    model: Mesin,
            	    required: true,
            	    attributes: ['nama_mesin']
            	},
			]
		});
		if (!masalah) {
			return res.status(404).json({
				status: "error",
				code: 404,
				message: "data tidak ditemukan"
			});
		}
		// new object
		const new_masalah = {
			no_masalah: masalah.no_masalah,
			tgl_masalah: masalah.tgl_masalah,
			nama_kategori: masalah.nama_kategori,
			kode_mesin: masalah.kode_mesin,
			nama_mesin: masalah.Mesin.nama_mesin,
			penyebab: masalah.penyebab,
			keterangan_masalah: masalah.keterangan_masalah,
			penanganan: masalah.penanganan,
			tgl_penanganan: masalah.tgl_penanganan,
			waktu_penanganan: masalah.waktu_penanganan,
			created_by: masalah.created_by,
			created_date: masalah.created_date,
			deleted_by: masalah.deleted_by,
			deleted_date: masalah.deleted_date,
			status: masalah.status,
		}
		// RESPONSE
		res.status(200).json({
			status: "success",
			code: 200,
			data: new_masalah,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: error || ["Internal server error"],
		});
	}
}
// CREATE MASALAH
const createMasalah = async (req, res) => {
	// GET PAYLOADS
	const { kode_mesin, penyebab, nama_kategori, keterangan_masalah } = req.body;
	// VALIDASI
	let errors = validationResult(req).array().map(er => { return er.msg || er.message })
	if (errors != "") return res.status(400).json({
		status: "error",
		code: 400,
		message: errors
	});
	const kodemesin = await Mesin.findByPk(kode_mesin)
	if(!kodemesin) return res.status(400).json({
		status: "error",
		code: 400,
		message: ["Kode mesin tidak ditemukan"]
	});
	// START TRANSACTION
	const transaction = await sequelize.transaction()
	try {
		// POST MASALAH
		const no_masalah = await formaterPK("masalah")
		const post_data = await Masalah.create({
            no_masalah: no_masalah,
            nama_kategori: nama_kategori,
            tgl_masalah: new Date().toISOString(),
            kode_mesin: kodemesin.kode_mesin,
            penyebab: penyebab.toString(),
            keterangan_masalah: keterangan_masalah.toString(),
			tgl_penanganan: "",
			penanganan: "",
			waktu_penanganan: 0,
            created_by: req.session.user,
            created_date: new Date().toISOString(),
            deleted_by: "",
            deleted_date: new Date(1).toISOString(),
            status: "open"
        },
		{ transaction: transaction })
        // CREATE LOG USER
		const log_user = await logUser.createLog(
			"Menambah data masalah",
			no_masalah,
			req.session.user,
			transaction
		);
		if (log_user.error) throw log_user.error;
		// COMMIT
		await transaction.commit()
		// RESPONSE
		res.status(201).json({
			status: "success",
			code: 201,
			message: ["Berhasil menambahkan data"],
			data: post_data,
		});
	} catch (error) {
		await transaction.rollback();
		res.status(500).json({
			status: "error",
			code: 500,
			message: error || ["Internal Server Error"],
		});
	}
};
// PENANGANAN MASALAH
const createPenanganan = async (req, res) => {
    // CEK PAYLOADS
    const no_masalah = req.params.no_masalah;
	const { penanganan, waktu_penanganan, detail } = req.body;
    // VALIDASI
	let errors = validationResult(req).array().map(er => { return er.msg || er.message })
	if (errors != "") return res.status(400).json({
		status: "error",
		code: 400,
		message: errors
	});
    // GET DATA BY PK
    const masalah = await Masalah.findByPk(no_masalah)
	if(!masalah) return res.status(404).json({
		status: "error",
		code: 404,
		message: ["No masalah tidak ditemukan"],
	});
	// START TRANSACTION
	const transaction = await sequelize.transaction()
	try {
		// UPDATE
		const updt = await masalah.update({
			penanganan: penanganan,
			tgl_penanganan: new Date().toISOString(),
			waktu_penanganan: waktu_penanganan,
			status: "close"
		},
		{ transaction: transaction })
		updt.save()
		// POST DETAIL
		let dt = await detailMasalah.createDetailMasalah(no_masalah, detail, transaction)
		if(dt.error) throw dt.error
		// CREATE LOG USER
		const log_user = await logUser.createLog(
			"Menambahkan penanganan",
			no_masalah,
			req.session.user,
			transaction
		);
		if (log_user.error) throw log_user.error
		// COMMIT
		await transaction.commit()
		// RESPONSE
		res.status(201).json({
			status: "success",
			code: 201,
			message: ["Berhasil menambahkan data"],
			data: dt,
		});
	} catch (error) {
		await transaction.rollback()
		res.status(500).json({
			status: "error",
			code: 500,
			message: error || ["Internal Server Error"],
		});
	}
}
// BATAL PENANGANAN
const deletePenanganan = async (req, res) => {
	const no_masalah = req.params.no_masalah
	// START TRANSACTION
	const transaction = await sequelize.transaction()
	try {
		// GET MASALAH HEAD
		const masalah = await Masalah.findByPk(no_masalah);
		if (!masalah) return res.status(500).json({
			status: "error",
			code: 500,
			message: ["No masalah tidak ditemukan"]
		});
		// UPDATE MASALAH HEAD
		await masalah.update({
			penanganan: '',
			tgl_penanganan: '',
			waktu_penanganan: '',
			status: "open"
		},
		{ transaction: transaction })
		masalah.save()

		const batal_detail = await detailMasalah.deleteDetailMasalah(no_masalah, req.session.user, transaction)
		if(batal_detail.error) throw batal_detail.error
		// CREATE LOG USER
		const log_user = await logUser.createLog(
			"Membatalkan penanganan",
			no_masalah,
			req.session.user,
			transaction
		);
		if (log_user.error) throw log_user.error;
		// COMMIT
		await transaction.commit()
		// RESPONSE
		res.status(201).json({
			status: "success",
			code: 201,
			message: ["Penanganan berhasil dibatalkan"],
		});
	} catch (error) {
		// ROLLBACK
		await transaction.rollback()
		res.status(500).json({
			status: "error",
			code: 500,
			message: error || ["Internal Server Error"],
		});
	}
}
// BATAL MASALAH
const deleteMasalah = async (req, res) => {
	const no_masalah = req.params.no_masalah;
	// START TRANSACTION
	const transaction = await sequelize.transaction()
	try {
		// CEK DATA BY PK
		let masalah = await Masalah.findByPk(no_masalah);

		if (!masalah) return res.status(500).json({
			status: "error",
			code: 500,
			message: ["No masalah tidak ditemukan"]
		});
		// batal detail
		const batal_detail = await detailMasalah.deleteDetailMasalah(no_masalah, req.session.user, transaction)
		if(batal_detail.error) throw batal_detail.error
		console.log(batal_detail);
		// UPDATE VALUE
		masalah.update({
			deleted_date: new Date().toISOString(),
			deleted_by: req.session.user,
			status: "false",
		}, { transaction: transaction })
		masalah.save();
		// CREATE LOG USER
		const log_user = await logUser.createLog(
			"Membatalkan masalah",
			no_masalah,
			req.session.user,
			transaction
		);
		if (log_user.error) throw log_user.error;
		// COMMIT
		await transaction.commit()
		// result
		// RESPONSE
		res.status(201).json({
			status: "success",
			code: 201,
			message: ["Masalah berhasil dibatalkan"],
		});
	} catch (error) {
		await transaction.rollback()
		res.status(500).json({
			status: "error",
			code: 500,
			message: error || ["Internal Server Error"],
		});
	}
};

module.exports = {
	getAll,
	getSearch,
	getByKode,
	createMasalah,
    createPenanganan,
	deleteMasalah,
	deletePenanganan
};
