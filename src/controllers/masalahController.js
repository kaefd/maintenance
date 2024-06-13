require("sequelize")
const { formaterPK } = require("../utils/utils")
const detailMasalah = require("./detailMasalahController")
const Masalah = require("../models/masalahModel")
const sequelize = require("../../connect")
const Mesin = require("../models/mesinModel")
const utils = require('./utils')
const LogMesin = require("../models/logMesinModel")
const LogUser = require("../models/logUser")

// BASE CONFIGURATION
let config = {
	model: Masalah,
	PK: "no_masalah",
	modelAssociation: [
		{
			toModel: Mesin,
			relation: "hasMany",
			model: Masalah,
			fk: "kode_mesin"
		},
		{
			toModel: Masalah,
			relation: "belongsTo",
			model: Mesin,
			fk: "kode_mesin",
		},
	],
	order: [["no_masalah", "DESC"]],
	include: [
		{ 
			model: Mesin,
			strModel: "Mesin",
			attributes: ["nama_mesin"]
		}
	],
}

const wipeData = () => {
	config = {
		model: Masalah,
		PK: "no_masalah",
		modelAssociation: [
			{
				toModel: Mesin,
				relation: "hasMany",
				model: Masalah,
				fk: "kode_mesin"
			},
			{
				toModel: Masalah,
				relation: "belongsTo",
				model: Mesin,
				fk: "kode_mesin",
			},
		],
		order: [["no_masalah", "DESC"]],
		include: [
			{ 
				model: Mesin,
				strModel: "Mesin",
				attributes: ["nama_mesin"]
			}
		],
	}
}
// GET ALL
const getAll = async (req, res) => {

	wipeData()

	let whereCondition = Object.fromEntries(
		Object.entries(req.query).filter(
			([key]) => key != "limit" && key != "page"
		)
	);
	whereCondition.status = whereCondition.status ?? ["open", "close"];
	config.limit = req.query.limit
	config.page = req.query.page
	config.whereCondition = whereCondition
	await utils.GetData(config, res)
	
}
// SEARCH
const getSearch = async (req, res) => {

	wipeData()
	
	let whereCondition = {
		status: req.query.status ?? ["open", "close"]
	}
	config.whereCondition = whereCondition
	config.input = req.query.search

	await utils.GetData(config, res)
}
// GET BY PK
const getByKode = async (req, res) => {

	wipeData()

	let whereCondition = {
		status: req.query.status ?? ["open", "close"]
	}
	config.whereCondition = whereCondition
	config.byPK = req.params.no_masalah

	await utils.GetData(config, res)
}
// CREATE MASALAH
const createMasalah = async (req, res) => {

	wipeData()

	// GET PAYLOADS
	const { kode_mesin, penyebab, nama_kategori, keterangan_masalah } = req.body;
	// VALIDATE
	let check = [
		{
			model: Mesin,
			whereCondition: {kode_mesin: kode_mesin},
			title: "Kode Mesin",
			check: "isAvailable",
		},
	];
	let validate = await utils.Validate(req, res, check)
	if(validate) return validate
	
	// START TRANSACTION
	const transaction = await sequelize.transaction()
	try {
		const no_masalah = await formaterPK("masalah")
		config.time_user_stamp = true
		config.log = [
			{
				model: LogMesin,
				data: {
					tanggal: new Date(),
					kode_mesin: kode_mesin,
					kategori: "bermasalah",
					keterangan: no_masalah,
					user_input: req.session.user
				},
			},
			{
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Menambah data masalah",
					keterangan: no_masalah,
					kode_user: req.session.user,
				}
			}
		]
		config.data = {
            no_masalah: no_masalah,
            nama_kategori: nama_kategori,
            tgl_masalah: new Date(),
            kode_mesin: kode_mesin,
            penyebab: penyebab ?? "",
            keterangan_masalah: keterangan_masalah ?? "",
			tgl_penanganan: "",
			penanganan: "",
			total_biaya: 0,
            user_penanganan: "",
            status: "open"
        }
		// POST DATA
		const result = await utils.CreateData(req, config, transaction)
		if(result.error) throw result.error
		// COMMIT
		await transaction.commit()
		// RESPONSE
		res.status(201).json({
			status: "success",
			code: 201,
			message: ["Berhasil menambahkan data"],
			data: result,
		});
	} catch (error) {
		await transaction.rollback();
		res.status(500).json({
			status: "error",
			code: 500,
			message: error ?? ["Internal Server Error"],
		});
	}
};
// PENANGANAN MASALAH
const createPenanganan = async (req, res) => {

	wipeData()

    // CEK PAYLOADS
    const no_masalah = req.params.no_masalah;
	const { penanganan, detail } = req.body;
    // VALIDASI
	let check = [
		{
			model: Masalah,
			whereCondition: {status: "open", no_masalah: no_masalah},
			title: "No Masalah",
			check: "isAvailable",
		},
	];
	let validate = await utils.Validate(req, res, check)
	if(validate) return validate
	
	// START TRANSACTION
	const transaction = await sequelize.transaction()
	try {
		let total_b = 0
		// POST DETAIL
		if(detail) {
			let dt = await detailMasalah.createDetailMasalah(no_masalah, detail, transaction)
			if(dt.error) throw dt.error
			total_b = dt.map(d => d.dataValues).map(d => d.biaya).reduce((partialSum, a) => partialSum + a, 0)
		}
		const masalah = await Masalah.findByPk(no_masalah)
		// UPDATE
		config.data = {
			no_masalah: no_masalah,
			penanganan: penanganan,
			tgl_penanganan: new Date().toISOString(),
			user_penanganan: req.session.user,
			total_biaya: total_b,
			status: "close"
		}
		config.log = [
			{
				model: LogMesin,
				data: {
					tanggal: new Date(),
					kode_mesin: masalah.kode_mesin,
					kategori: "ditangani",
					keterangan: no_masalah,
					user_input: req.session.user
				},
			},
			{
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Menambahkan penanganan",
					keterangan: no_masalah,
					kode_user: req.session.user,
				}
			}
		]
		const result = await utils.UpdateData(req, config, transaction)
		// COMMIT
		await transaction.commit()
		// RESPONSE
		res.status(201).json({
			status: "success",
			code: 201,
			message: ["Berhasil menambahkan data"],
			data: result,
		});
	} catch (error) {
		await transaction.rollback()
		res.status(500).json({
			status: "error",
			code: 500,
			message: error ?? ["Internal Server Error"],
		});
	}
}
// BATAL PENANGANAN
const deletePenanganan = async (req, res) => {

	wipeData()

	const no_masalah = req.params.no_masalah
	// VALIDATE
	let check = [
		{
			model: Masalah,
			whereCondition: {no_masalah: no_masalah, penanganan: ""},
			title: "No Masalah",
			message: "Belum ada penanganan",
			check: "isDuplicate",
		},
	];
	let validate = await utils.Validate(req, res, check)
	if(validate) return validate
	// START TRANSACTION
	const transaction = await sequelize.transaction()
	try {
		// GET MASALAH HEAD
		const masalah = await Masalah.findByPk(no_masalah);
		// UPDATE MASALAH HEAD
		config.data = {
			no_masalah: no_masalah,
			penanganan: '',
			user_penanganan: '',
			tgl_penanganan: '',
			total_biaya: 0,
			status: "open"
		}
		config.log = [
			{
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Membatalkan penanganan",
					keterangan: no_masalah,
					kode_user: req.session.user,
				}
			}
		]
		const updateMslHead = await utils.UpdateData(req, config, transaction)
		if(updateMslHead.error) throw updateMslHead.error
		// DELETE DETAIL
		const batal_detail = await detailMasalah.deleteDetailMasalah(no_masalah, req.session.user, transaction)
		if(batal_detail.error) throw batal_detail.error

		wipeData()

		// DELETE LOG MESIN
		config.model = LogMesin
		config.PK = "kode_mesin"
		config.data = {
			kode_mesin: masalah.kode_mesin,
			kategori: "ditangani",
			keterangan: no_masalah
		}
		let deleteLog = await utils.DeleteData(req, config, transaction)
		if(deleteLog.error) throw deleteLog.error
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
			message: error ?? ["Internal Server Error"],
		});
	}
}
// BATAL MASALAH
const deleteMasalah = async (req, res) => {

	wipeData()
	
	const no_masalah = req.params.no_masalah;
	// START TRANSACTION
	const transaction = await sequelize.transaction()
	try {
		const masalah = await Masalah.findByPk(no_masalah);
		// UPDATE MASALAH HEAD
		config.data = {
			no_masalah: no_masalah,
			deleted_date: new Date().toISOString(),
			deleted_by: req.session.user,
			status: "false",
		}
		config.log = [
			{
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Membatalkan masalah",
					keterangan: no_masalah,
					kode_user: req.session.user,
				}
			}
		]
		const updateMslHead = await utils.UpdateData(req, config, transaction)
		if(updateMslHead.error) throw updateMslHead.error
		// BATAL DETAIL
		const batal_detail = await detailMasalah.deleteDetailMasalah(no_masalah, req.session.user, transaction)
		if(batal_detail.error) throw batal_detail.error

		wipeData()

		// DELETE LOG MESIN PENANGANAN
		config.model = LogMesin
		config.PK = "kode_mesin"
		config.data = {
			kode_mesin: masalah.kode_mesin,
			kategori: "ditangani",
			keterangan: no_masalah
		}
		let delLogMesinPenanganan = await utils.DeleteData(req, config, transaction)
		if(delLogMesinPenanganan.error) throw delLogMesinPenanganan.error

		wipeData()
		
		// DELETE LOG MESIN MASALAH
		config.model = LogMesin
		config.PK = "kode_mesin"
		config.data = {
			kode_mesin: masalah.kode_mesin,
			kategori: "bermasalah",
			keterangan: no_masalah
		}
		let delLogMesinMasalah = await utils.DeleteData(req, config, transaction)
		if(delLogMesinMasalah.error) throw delLogMesinMasalah.error
		// COMMIT
		await transaction.commit()
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
			message: error ?? ["Internal Server Error"],
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
