require("sequelize")
const { formaterPK } = require("../utils/utils")
const detailMasalah = require("./penangananDetail")
const Penanganan = require("../models/penangananModel")
const sequelize = require("../../connect")
const Mesin = require("../models/mesinModel")
const utils = require('./utils')
const LogMesin = require("../models/logMesinModel")
const LogUser = require("../models/logUser")
const Sparepart = require("../models/sparepartModel")
const Masalah = require("../models/masalahModel")

// BASE CONFIGURATION
let config = {
	model: Penanganan,
	PK: "no_penanganan",
	order: [["no_penanganan", "DESC"]],
}

const wipeData = () => {
	config = {
		model: Penanganan,
		PK: "no_penanganan",
		order: [["no_penanganan", "DESC"]],
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
	config.limit = req.query.limit
	config.page = req.query.page
	config.whereCondition = whereCondition
	await utils.GetData(config, res)
	
}
// SEARCH
const getSearch = async (req, res) => {

	wipeData()
	
	config.input = req.query.search
	await utils.GetData(config, res)
}
// GET BY PK
const getByKode = async (req, res) => {

	wipeData()
	config.byPK = req.params.no_penanganan

	await utils.GetData(config, res)
}
// CREATE PENANGANAN
const createPenanganan = async (req, res) => {

	wipeData()

    // CEK PAYLOADS
    const no_masalah = req.params.no_masalah;
	const { nama_penanganan, detail } = req.body;
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
		let no_penanganan = await formaterPK("penanganan")
		let total_b = 0

		let masalah = await Masalah.findOne({
			where: {
				no_masalah: no_masalah,
				status: "open"
			}
		})
		// POST DETAIL
		if(detail) {
			let dt = await detailMasalah.createPenangananDetail(no_penanganan, detail, transaction)
			console.log(dt);
			if(dt.error) throw dt.error
			total_b = dt.map(d => d.dataValues).map(d => d.nilai).reduce((partialSum, a) => partialSum + a, 0)
		}
		// POST
		config.data = {
			no_penanganan: no_penanganan,
			no_masalah: no_masalah,
			nama_penanganan: nama_penanganan,
			tgl_penanganan: new Date().toISOString(),
			user_input: req.session.user,
			total_nilai: total_b,
			status: "true"
		}
		config.log = [
			{
				model: LogMesin,
				data: {
					tanggal: new Date(),
					kode_mesin: masalah.kode_mesin,
					kategori: "ditangani",
					keterangan: no_penanganan,
					user_input: req.session.user
				},
			},
			{
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Menambahkan penanganan",
					keterangan: no_penanganan,
					username: req.session.user,
				}
			}
		]
		const result = await utils.CreateData(req, config, transaction)
		if(!result) return ["penananganan gagal"]
		// COMMIT
		await transaction.commit()
		// RESPONSE
		res.status(201).json({
			status: "success",
			code: 201,
			message: ["Berhasil menambahkan penanganan"],
			data: result,
		});
	} catch (error) {
		await transaction.rollback()
		res.status(500).json({
			status: "error",
			code: 500,
			message: [error] ?? ["Internal Server Error"],
		});
	}
}
// BATAL PENANGANAN
const deletePenanganan = async (req, res) => {

	wipeData()

	const no_penanganan = req.params.no_penanganan;
	// VALIDATE
	let check = [
		{
			model: Penanganan,
			whereCondition: {no_penanganan: no_penanganan, status: "true"},
			title: "No Penanganan",
			message: "Belum ada penanganan",
			check: "isAvailable",
		},
	];
	let validate = await utils.Validate(req, res, check)
	if(validate) return validate
	// START TRANSACTION
	const transaction = await sequelize.transaction()
	try {
		// GET MASALAH HEAD
		const penanganan = await Penanganan.findByPk(no_penanganan);
		const masalah = await Masalah.findByPk(penanganan.no_masalah);
		// UPDATE MASALAH HEAD
		// config.data = {
		// 	status: "false"
		// }
		config.data = {
			no_penanganan: no_penanganan,
			status: "false"
		}
		config.log = [
			{
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Membatalkan penanganan",
					keterangan: no_penanganan,
					username: req.session.user,
				}
			},
			{
				model: LogMesin,
				data: {
					kode_mesin: masalah.dataValues.kode_mesin,
					kategori: "ditangani",
					keterangan: no_penanganan,
					user_input: req.session.user
				}
			}
		]
		// const updateMslHead = await utils.DeleteData(req, config, transaction)
		// if(updateMslHead.error) throw updateMslHead.error
		// DELETE DETAIL
		const batal_detail = await detailMasalah.deletePenangananDetail(no_penanganan, req.session.user, transaction)
		if(batal_detail.error) throw batal_detail.error

		// wipeData()

		// DELETE LOG MESIN
		// config.model = LogMesin
		// config.PK = "kode_mesin"
		// config.data = {
		// 	kode_mesin: masalah.kode_mesin,
		// 	kategori: "ditangani",
		// 	keterangan: no_penanganan
		// }
		let deleteLog = await utils.UpdateData(req, config, transaction)
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
	
	const no_penanganan = req.params.no_penanganan;
	// START TRANSACTION
	const transaction = await sequelize.transaction()
	try {
		const masalah = await Masalah.findByPk(no_penanganan);
		// UPDATE MASALAH HEAD
		config.data = {
			no_penanganan: no_penanganan,
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
					keterangan: no_penanganan,
					username: req.session.user,
				}
			}
		]
		const updateMslHead = await utils.UpdateData(req, config, transaction)
		if(updateMslHead.error) throw updateMslHead.error
		// BATAL DETAIL
		const batal_detail = await detailMasalah.deleteDetailMasalah(no_penanganan, req.session.user, transaction)
		if(batal_detail.error) throw batal_detail.error

		wipeData()

		// DELETE LOG MESIN PENANGANAN
		config.model = LogMesin
		config.PK = "kode_mesin"
		config.data = {
			kode_mesin: masalah.kode_mesin,
			kategori: "ditangani",
			keterangan: no_penanganan
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
			keterangan: no_penanganan
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
    createPenanganan,
	deleteMasalah,
	deletePenanganan
};
