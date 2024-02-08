const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
const Mesin = require("../models/mesinModel");
const LogUser = require("../models/logUser");
const logUser = require("./logUserController");
const sequelize = require("../../connect");

// GET ALL
const getAll = async (req, res) => {
	try {
		const mesin = await Mesin.findAll({
			where: {
				status: "true",
			},
		});
		if (!mesin) return res.status(404).json({
			status: "error",
			code: 404,
			message: "data tidak ditemukan"
		});
		// RESPONSE
		res.status(200).json({
			status: "success",
			code: 200,
			data: mesin,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: error|| "Internal server error",
		});
	}
};
// GET BY KODE
const getByKode = async (req, res) => {
	const kode_mesin = req.params.kode_mesin;
	try {
		const mesin = await Mesin.findByPk(kode_mesin);
		if (!mesin) return res.status(404).json({
			status: "error",
			code: 404,
			message: "data tidak ditemukan"
		});
		res.status(200).json({
			status: "success",
			code: 200,
			data: mesin,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: error || "Internal server error",
		});
	}
};
// CREATE MESIN
const createMesin = async (req, res) => {
	// PAYLOAD
	const { kode_mesin, nama_mesin, keterangan, tgl_beli, supplier } = req.body;
	// VALIDASI
	let errors = validationResult(req).array().map(er => { return er.msg || er.message })
	if (errors != "") return res.status(400).json({
		status: "error",
		code: 400,
		message: errors
	});
	const existKode = await Mesin.findOne({ where: { kode_mesin: kode_mesin } });
	if (existKode) return res.status(400).json({
		status: "error",
		code: 400,
		message: "Kode mesin sudah terdaftar"
	});
	// START TRANSACTION
	const transaction = await sequelize.transaction();
	// CREATE DATA
	try {
		const newMesin = await Mesin.create(
			{
				kode_mesin: kode_mesin.toString(),
				nama_mesin: nama_mesin.toString(),
				keterangan: keterangan ? keterangan.toString() : "",
				tgl_beli,
				supplier: supplier.toString(),
				created_by: req.session.user,
				created_date: new Date().toISOString(),
				deleted_by: "",
				deleted_date: new Date(1).toISOString(),
				status: "true",
			},
			{ transaction: transaction }
		);
		// CREATE LOG USER
		const log_user = await logUser.createLog(
			"Menambah data mesin",
			kode_mesin,
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
			message: "Berhasil menambahkan data",
			data: newMesin,
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
// EDIT
const editMesin = async (req, res) => {
	const kode = req.params.kode;
	const { nama_mesin, keterangan, tgl_beli, supplier } = req.body;
	// VALIDASI
	const errors = validationResult(req).array().map(er => { return er.msg || er.message });
	if (errors != "") return res.status(400).json({
		status: "error",
		code: 400,
		message: errors
	});
	const mesin = await Mesin.findOne({
		where: {
			kode_mesin: kode,
			status: "true",
		},
	});
	if (!mesin) return res.status(404).json({
		status: "error",
		code: 404,
		message: "Kode mesin tidak ditemukan"
	});
	// START TRANSACTION
	const transaction = await sequelize.transaction();
	try {
		const updt = await mesin.update(
			{
				nama_mesin: nama_mesin.toString(),
				keterangan: keterangan ? keterangan.toString() : "",
				tgl_beli: tgl_beli,
				supplier: supplier.toString(),
				status: "true",
			},
			{ transaction: transaction }
		);
		updt.save();
		// CREATE LOG USER
		const log_user = await logUser.createLog(
			"Mengubah data mesin",
			updt.kode_mesin,
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
			data: updt,
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
// DELETE
const deleteMesin = async (req, res) => {
	const kode = req.params.kode;
	// START TRANSACTION
	const transaction = await sequelize.transaction();
	try {
		const mesin = await Mesin.findByPk(kode);
		if (!mesin)
			return res.status(404).json({
				status: "error",
				code: 404,
				message: "Kode mesin tidak ditemukan"
			});
		// UPDATE DATA
		const updt = await mesin.update(
			{
				deleted_by: req.session.user,
				deleted_date: new Date().toISOString(),
				status: "false",
			},
			{ transaction: transaction }
		);
		mesin.save;
		// CREATE LOG
		const log_user = await logUser.createLog(
			"Menghapus data mesin",
			updt.kode_mesin,
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
			message: "Data berhasil dihapus",
		});
	} catch (error) {
		await transaction.rollback();
		res.status(500).json({
			status: "error",
			code: 500,
			message: error || "gagal menambahkan data",
		});
	}
};

module.exports = {
	getAll,
	getByKode,
	createMesin,
	editMesin,
	deleteMesin,
};
