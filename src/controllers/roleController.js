const { validationResult } = require("express-validator");
const logUser = require("./logUserController");
const sequelize = require("../../connect");
const RoleModel = require("../models/RoleModel");

// GET ALL
const getAll = async (req, res) => {
	const { limit = 10, page = 1 } = req.query;
	const offset = (page - 1) * limit;
	try {
		const role = await RoleModel.findAll({
			limit: parseInt(limit),
			offset: parseInt(offset),
		})
		const total = await RoleModel.findAll()
		if (!role) return res.status(404).json({
			status: "error",
			code: 404,
			message: ["data tidak ditemukan"]
		});
		var re = page > 1 ? total.length - (page * limit - limit) -  role.length : total.length - role.length
		// RESPONSE
		res.status(200).json({
			status: "success",
			code: 200,
			page: parseInt(page),
			limit: parseInt(limit),
			rows: role.length,
			totalData: total.length,
			remainder: re || 0,
			data: role,
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
		let role = await RoleModel.findAll()
		if (!role) return res.status(404).json({
			status: "error",
			code: 404,
			message: ["data tidak ditemukan"]
		});
		let nwrole = role.map(i => i.dataValues)
		const search = input ? nwrole.filter(item => Object.values(item).some(value => typeof value == 'string' && value.toLowerCase().includes(input.toLowerCase()))) : role
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
		const role = await RoleModel.findByPk(id);
		if (!role) return res.status(404).json({
			status: "error",
			code: 404,
			message: ["data tidak ditemukan"]
		});
		res.status(200).json({
			status: "success",
			code: 200,
			data: role,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: error || ["Internal server error"],
		});
	}
};
// CREATE MESIN
const createRole = async (req, res) => {
	// PAYLOAD
	const { nama_role } = req.body;
	// VALIDASI
	let errors = validationResult(req).array().map(er => { return er.msg || er.message })
	if (errors != "") return res.status(400).json({
		status: "error",
		code: 400,
		message: errors
	});
	const existKode = await RoleModel.findOne({ where: { nama_role: nama_role } });
	if (existKode) return res.status(400).json({
		status: "error",
		code: 400,
		message: ["Role sudah terdaftar"]
	});
	// START TRANSACTION
	const transaction = await sequelize.transaction();
	// CREATE DATA
	try {
		const newRole = await RoleModel.create(
			{
				nama_role: nama_role.toString(),
			},
			{ transaction: transaction }
		);
		
		// CREATE LOG USER
		const log_user = await logUser.createLog(
			"Menambah data role",
			nama_role,
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
			data: newRole,
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
const editRole = async (req, res) => {
	const id = req.params.id;
	const { nama_role } = req.body;
	// VALIDASI
	const errors = validationResult(req).array().map(er => { return er.msg || er.message });
	if (errors != "") return res.status(400).json({
		status: "error",
		code: 400,
		message: errors
	});
	const role = await RoleModel.findOne({
		where: {
			id_role: id,
		},
	});
	if (!role) return res.status(404).json({
		status: "error",
		code: 404,
		message: ["Data tidak ditemukan"]
	});
	// START TRANSACTION
	const transaction = await sequelize.transaction();
	try {
		const updt = await role.update(
			{
				nama_role: nama_role ? nama_role.toString() : role.nama_role,
			},
			{ transaction: transaction }
		);
		updt.save();
		// CREATE LOG USER
		const log_user = await logUser.createLog(
			"Mengubah data role",
			updt.nama_role,
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
			message: ["Role berhasil diupdate"],
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
const deleteRole = async (req, res) => {
	const id = req.params.id;
	// START TRANSACTION
	const transaction = await sequelize.transaction();
	try {
		const role = await RoleModel.findByPk(id);
		if (!role)
			return res.status(404).json({
				status: "error",
				code: 404,
				message: ["Role tidak ditemukan"]
			});
		// UPDATE DATA
		// CREATE LOG
		const log_user = await logUser.createLog(
			"Menghapus data role",
			role.nama_role,
			req.session.user,
			transaction
		);
		await role.destroy(id)
		if (log_user.error) throw log_user.error;
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
	createRole,
	editRole,
	deleteRole,
};
