const { validationResult } = require("express-validator");
const KategoriMasalah = require("../models/kategoriMasalahModel");
const logUser = require("./logUserController");
const sequelize = require("../../connect");

// GET ALL
const getAll = async (req, res) => {
	const { limit = 10, page = 1 } = req.query;
	const offset = (page - 1) * limit;
	try {
		const kategori = await KategoriMasalah.findAll({
			limit: parseInt(limit),
			offset: parseInt(offset),
		})
		const total = await KategoriMasalah.findAll()
		if (!kategori) return res.status(404).json({
			status: "error",
			code: 404,
			message: ["data tidak ditemukan"]
		});
		var re = page > 1 ? total.length - (page * limit - limit) -  kategori.length : total.length - kategori.length
		// RESPONSE
		res.status(200).json({
			status: "success",
			code: 200,
			page: parseInt(page),
			limit: parseInt(limit),
			rows: kategori.length,
			totalData: total.length,
			remainder: re || 0,
			data: kategori,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: error|| ["Internal server error"],
		});
	}
};
const getSearch = async (req, res) => {
	const input = req.query.search
	try {
		let kategori = await KategoriMasalah.findAll()
		if (!kategori) return res.status(404).json({
			status: "error",
			code: 404,
			message: ["data tidak ditemukan"]
		});
		let nwkategori = kategori.map(i => i.dataValues)
		const search = input ? nwkategori.filter(item => Object.values(item).some(value => typeof value == 'string' && value.toLowerCase().includes(input.toLowerCase()))) : kategori
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
// GET BY KODE
const getByKode = async (req, res) => {
	const id = req.params.id;
	try {
		const kategori = await KategoriMasalah.findByPk(id);
		if (!kategori) return res.status(404).json({
			status: "error",
			code: 404,
			message: ["data tidak ditemukan"]
		});
		res.status(200).json({
			status: "success",
			code: 200,
			data: kategori,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: error || ["Internal server error"],
		});
	}
};
// CREATE KATEGORI
const createKategori = async (req, res) => {
	// PAYLOAD
	const { nama_kategori } = req.body;
	// VALIDASI
	let errors = validationResult(req).array().map(er => { return er.msg || er.message })
	if (errors != "") return res.status(400).json({
		status: "error",
		code: 400,
		message: errors
	});
	const existKode = await KategoriMasalah.findOne({ where: { nama_kategori: nama_kategori } });
	if (existKode) return res.status(400).json({
		status: "error",
		code: 400,
		message: ["Kategori masalah sudah terdaftar"]
	});
	// START TRANSACTION
	const transaction = await sequelize.transaction();
	// CREATE DATA
	try {
		const newKategori = await KategoriMasalah.create(
			{
				nama_kategori: nama_kategori.toString(),
			},
			{ transaction: transaction }
		);
		
		// CREATE LOG USER
		const log_user = await logUser.createLog(
			"Menambah data kategori masalah",
			nama_kategori,
			req.session.user,
			transaction
		);
		if (log_user.error) throw log_user.error;
		// COMMIT
		await transaction.commit();
		// RESPONSE
		res.status(201).json({
			status: "success",
			code: 201,
			message: ["Berhasil menambahkan data"],
			data: newKategori,
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
// EDIT
const editKategori = async (req, res) => {
	const kode = req.params.kode;
	const { nama_kategori } = req.body;
	// VALIDASI
	const errors = validationResult(req).array().map(er => { return er.msg || er.message });
	if (errors != "") return res.status(400).json({
		status: "error",
		code: 400,
		message: errors
	});
	const kategori = await KategoriMasalah.findOne({
		where: {nama_kategori: kode}
	});
	if (!kategori) return res.status(404).json({
		status: "error",
		code: 404,
		message: ["kategori masalah tidak ditemukan"]
	});
	// START TRANSACTION
	const transaction = await sequelize.transaction();
	try {
		const updt = await kategori.update(
			{
				nama_kategori: nama_kategori ? nama_kategori.toString() : kategori.nama_kategori,
			},
			{ transaction: transaction }
		);
		updt.save();
		// CREATE LOG USER
		const log_user = await logUser.createLog(
			"Mengubah data kategori",
			updt.nama_kategori,
			req.session.user,
			transaction
		);
		if (log_user.error) throw log_user.error;
		// COMMIT
		await transaction.commit();
		// RESULT
		res.status(201).json({
			status: "success",
			code: 201,
			message: ["Kategori masalah berhasil diupdate"],
			data: updt,
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
// DELETE
const deleteKategori = async (req, res) => {
	const kode = req.params.kode;
	// START TRANSACTION
	const transaction = await sequelize.transaction();
	try {
		const kategori = await KategoriMasalah.findOne({
			where: {nama_kategori: kode}
		});
		if (!kategori)
			return res.status(404).json({
				status: "error",
				code: 404,
				message: ["kategori tidak ditemukan"]
			});
		// CREATE LOG
		const log_user = await logUser.createLog(
			"Menghapus data kategori masalah",
			kategori.nama_kategori,
			req.session.user,
			transaction
		);
		if (log_user.error) throw log_user.error;
		// DELETE
		await kategori.destroy({
			where: {
				nama_kategori: kode
			}
		},
		{ transaction: transaction }
		);
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
			message: error || ["gagal menghapus data"],
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
