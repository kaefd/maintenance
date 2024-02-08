const { Op } = require("sequelize")
const { validationResult } = require("express-validator")
const { formaterPK } = require("../utils/utils")
const detailMasalah = require("./detailMasalahController")
const logUser = require("./logUserController")
const Masalah = require("../models/masalahModel")
const DetailMasalah = require("../models/masalahModel")
const sequelize = require("../../connect")
const Mesin = require("../models/mesinModel")

// GET ALL
const getAll = async (req, res) => {
	// MODEL ASSOSIATION
	Mesin.hasMany(Masalah, {foreignKey: 'kode_mesin'})
	Masalah.belongsTo(Mesin, {foreignKey: 'kode_mesin'})
	try {
		let whereCondition = {};
		if (req.query.no_masalah) {
			whereCondition.no_masalah = req.query.no_masalah
		}
		if(req.query.kode_mesin) {
			whereCondition.kode_mesin = req.query.kode_mesin
		}
		whereCondition.status = "true";
		let masalah = await Masalah.findAll({
			where: whereCondition,
			include: [{
                model: Mesin,
                required: true,
                attributes: ['nama_mesin']
            }]
		});
		if (!masalah) {
			return res.status(404).json({
				status: "error",
				code: 404,
				message: "data tidak ditemukan"
			});
		}
		// new object
		const new_masalah = masalah.map(m => { return {
			no_masalah: m.no_masalah,
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
		}})
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
			message: error|| "Internal server error",
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
			include: [{
                model: Mesin,
                required: true,
                attributes: ['nama_mesin']
            }]
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
			message: error || "Internal server error",
		});
	}
}
// CREATE MASALAH
const createMasalah = async (req, res) => {
	// GET PAYLOADS
	const { kode_mesin, penyebab, keterangan_masalah } = req.body;
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
		message: "Kode mesin tidak ditemukan"
	});
	// START TRANSACTION
	const transaction = await sequelize.transaction()
	try {
		// POST MASALAH
		const no_masalah = await formaterPK("masalah")
		const post_data = await Masalah.create({
            no_masalah: no_masalah,
            tgl_masalah: new Date().toISOString,
            kode_mesin: kodemesin.kode_mesin,
            penyebab: penyebab.toString(),
            keterangan_masalah: keterangan_masalah.toString(),
			tgl_penanganan: "",
			penanganan: "",
            created_by: req.session.user,
            created_date: new Date().toISOString(),
            deleted_by: "",
            deleted_date: new Date(1).toISOString(),
            status: "true"
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
			message: "Berhasil menambahkan data",
			data: post_data,
		});
	} catch (error) {
		await transaction.rollback();
		res.status(500).json({
			status: "error",
			code: 500,
			message: error || "Internal Server Error",
		});
	}
};
// PENANGANAN MASALAH
const createPenanganan = async (req, res) => {
    // CEK PAYLOADS
    const no_masalah = req.params.no_masalah;
	const { penanganan, waktu_penanganan, masalah_detail } = req.body;
    // VALIDASI
	let errors = validationResult(req).array().map(er => { return er.msg || er.message })
	if (errors != "") return res.status(400).json({
		status: "error",
		code: 400,
		message: errors
	});
    // GET DATA BY PK
    const masalah = await Masalah.findOne({ where: {
		no_masalah: no_masalah,
		status: "true"
	}})
	if(!masalah) return res.status(404).json({
		status: "error",
		code: 404,
		message: "No masalah tidak ditemukan",
	});
	// START TRANSACTION
	const transaction = await sequelize.transaction()
	try {
		// UPDATE
		const updt = await masalah.update({
			penanganan: penanganan,
			tgl_penanganan: new Date().toISOString(),
			waktu_penanganan: waktu_penanganan,
		},
		{ transaction: transaction })
		updt.save()
		// POST DETAIL
		let detail = await detailMasalah.createDetailMasalah(no_masalah, masalah_detail, transaction)
		if(detail.error) throw detail.error
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
			message: "Berhasil menambahkan data",
			data: detail,
		});
	} catch (error) {
		await transaction.rollback()
		res.status(500).json({
			status: "error",
			code: 500,
			message: error || "Internal Server Error",
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
		const masalah = await Masalah.findOne({ where: {
			no_masalah: no_masalah,
			status: 'true'
		}});
		if (!masalah) return res.status(500).json({
			status: "error",
			code: 500,
			message: "No masalah tidak ditemukan"
		});
		// UPDATE MASALAH HEAD
		masalah.update({
			penanganan: '',
			tgl_penanganan: '',
			waktu_penanganan: '',
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
			message: "Penanganan berhasil dibatalkan",
		});
	} catch (error) {
		// ROLLBACK
		await transaction.rollback()
		res.status(500).json({
			status: "error",
			code: 500,
			message: error || "Internal Server Error",
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
		const masalah = await Masalah.findOne({ where: {
			no_masalah: no_masalah,
			status: 'true'
		}});
		if (!masalah) return res.status(500).json({
			status: "error",
			code: 500,
			message: "No masalah tidak ditemukan"
		});
		// batal detail
		const batal_detail = await detailMasalah.deleteDetailMasalah(no_masalah, req.session.user, transaction)
		if(batal_detail.error) throw batal_detail.error
		// UPDATE VALUE
		await masalah.update({
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
			message: "Masalah berhasil dibatalkan",
		});
	} catch (error) {
		await transaction.rollback()
		res.status(500).json({
			status: "error",
			code: 500,
			message: error || "Internal Server Error",
		});
	}
};

module.exports = {
	getAll,
	getByKode,
	createMasalah,
    createPenanganan,
	deleteMasalah,
	deletePenanganan
};
