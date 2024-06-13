const { validationResult } = require("express-validator");
const KategoriMasalah = require("../models/kategoriMasalahModel");
const logUser = require("./logUserController");
const sequelize = require("../../connect");
const utils = require("./utils")
const LogUser = require("../models/logUser");

// BASE CONFIGURATION
let config = {
	model: KategoriMasalah,
	PK: "id_kategori",
};

const wipeData = () => {
	config = {
		model: KategoriMasalah,
		PK: "id_kategori",
	}
}

// GET ALL
const getAll = async (req, res) => {

	wipeData()

	let whereCondition = Object.fromEntries(
		Object.entries(req.query).filter(
			([key, value]) => key != "limit" && key != "page"
		)
	);
	config.limit = req.query.limit
	config.page = req.query.page
	config.whereCondition = whereCondition

	await utils.GetData(config, res)

};
const getSearch = async (req, res) => {

	wipeData()

	config.input = req.query.search
	await utils.GetData(config, res)
}
// GET BY KODE
const getByKode = async (req, res) => {

	wipeData()

	config.byPK = req.params.kode
	await utils.GetData(config, res)
};
// CREATE KATEGORI
const createKategori = async (req, res) => {

	wipeData()

	// PAYLOAD
	const { nama_kategori } = req.body;
	// VALIDASI
	let validate = await utils.Validate(req, res, [])
	if(validate) return validate

	let check = [
		{
			model: KategoriMasalah,
			whereCondition: { 
				nama_kategori: nama_kategori,
			},
			title: "Nama Kategori",
			check: "isDuplicate",
		},
	];
	validate = await utils.Validate(req, res, check)
	if(validate) return validate
	// START TRANSACTION
	const transaction = await sequelize.transaction();
	// CREATE DATA
	try {
		config.data = {
			nama_kategori: nama_kategori
		}
		config.log = [
			{
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Menambahkan kategori masalah",
					keterangan: nama_kategori,
					kode_user: req.session.user,
				}
			}
		]
		// POST DATA
		const result = await utils.CreateData(req, config, transaction)
		if(result.error) throw result.error
		// COMMIT
		await transaction.commit();
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
// EDIT
const editKategori = async (req, res) => {

	wipeData()

	const kode = req.params.kode;
	const { nama_kategori } = req.body;
	// VALIDASI
    let check = [
		{
			model: KategoriMasalah,
			whereCondition: {id_kategori: kode},
			title: "Kategori Masalah",
			check: "isAvailable",
		},
	];
    let validate = await utils.Validate(req, res, check)
	if(validate) return validate
	// START TRANSACTION
	const transaction = await sequelize.transaction();
	try {
		const kategori = await KategoriMasalah.findByPk(kode)
		config.data = {
			id_kategori: kode,
			nama_kategori: nama_kategori ?? kategori.nama_kategori
		}
		config.log = [
			{
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Mengubah kategori masalah",
					keterangan: nama_kategori,
					kode_user: req.session.user,
				}
			}
		]
		await utils.UpdateData(req, config, transaction)
		// COMMIT
		await transaction.commit();
		// RESULT
		res.status(201).json({
			status: "success",
			code: 201,
			message: ["Kategori masalah berhasil diupdate"],
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
// DELETE
const deleteKategori = async (req, res) => {

	wipeData()

	const kode = req.params.kode;
	// START TRANSACTION
	const transaction = await sequelize.transaction();
	try {
		config.data = { id_kategori: kode }
		config.log = [
			{
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Menghapus kategori masalah",
					keterangan: kode,
					kode_user: req.session.user,
				}
			}
		]
		let deleteLog = await utils.DeleteData(req, config, transaction)
		if(deleteLog.error) throw deleteLog.error
		// COMMIT
		await transaction.commit();
		// RESPONSE
		res.status(201).json({
			status: "success",
			code: 201,
			message: ["Data berhasil dihapus"],
		});
	} catch (error) {
		await transaction.rollback();
		res.status(500).json({
			status: "error",
			code: 500,
			message: error ?? ["gagal menghapus data"],
		});
	}
};

module.exports = {
	getAll,
	getSearch,
	getByKode,
	createKategori,
	editKategori,
	deleteKategori,
};
