const { validationResult } = require("express-validator");
const logUser = require("./logUserController");
const sequelize = require("../../connect");
const RoleModel = require("../models/RoleModel");
const utils = require("./utils");
const LogUser = require("../models/logUser");

// BASE CONFIGURATION
let config = {
	model: RoleModel,
	PK: "id_role",
};
const wipeData = () => {
	config = {
		model: RoleModel,
		PK: "id_role",
	};
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

	config.byPK = req.params.id
	await utils.GetData(config, res)

};
// CREATE
const createRole = async (req, res) => {

	wipeData()

	// PAYLOAD
	const { nama_role } = req.body;
	// VALIDASI
	let check = []
	if(nama_role) {
		check = [
			{
				model: RoleModel,
				whereCondition: {nama_role: nama_role},
				title: "Role",
				check: "isDuplicate",
			},
		];
	}
	let validate = await utils.Validate(req, res, check)
	if(validate) return validate

	// START TRANSACTION
	const transaction = await sequelize.transaction();
	// CREATE DATA
	try {
		config.data = {
			nama_role: nama_role.toString()
		}
		config.log = [
			{
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Menambah data role",
					keterangan: nama_role,
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
			message: error || ["Internal Server Error"],
		});
	}
};
// EDIT
const editRole = async (req, res) => {

	wipeData()

	const id = req.params.id;
	const { nama_role } = req.body;
	// VALIDASI
	let check = [
		{
			model: RoleModel,
			whereCondition: {id_role: id},
			title: "Role",
			check: "isAvailable",
		},
	];
    let validate = await utils.Validate(req, res, check)
	if(validate) return validate

	// START TRANSACTION
	const transaction = await sequelize.transaction();
	try {
		const role = await RoleModel.findOne({
			where: {
				id_role: id,
			},
		});
		config.data = {
			id_role: id,
			nama_role: nama_role ? nama_role.toString() : role.nama_role,
		}
		config.log = [
			{
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Mengubah data role",
					keterangan: nama_role ?? role.nama_role,
					kode_user: req.session.user,
				}
			}
		]
		const result = await utils.UpdateData(req, config, transaction)
		// COMMIT
		await transaction.commit();
		// RESULT
		res.status(201).json({
			status: "success",
			code: 201,
			message: ["Role berhasil diupdate"],
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
const deleteRole = async (req, res) => {

	wipeData()

	const id = req.params.id;
	// START TRANSACTION
	const transaction = await sequelize.transaction();
	try {
		const role = await RoleModel.findByPk(id)
		const nama_role = role.nama_role

		config.data = {id_role: id}
		config.log = [
			{
				model: LogUser,
				data:  {
					tanggal: new Date(),
					kategori: "Menghapus Data Role",
					keterangan: nama_role,
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
	createRole,
	editRole,
	deleteRole,
};
