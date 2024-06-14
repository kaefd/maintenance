const Mesin = require("../models/mesinModel");
const sequelize = require("../../connect");
const utils = require("./utils");
const LogUser = require("../models/logUser");
const LogMesin = require("../models/logMesinModel");

// BASE CONFIGURATION
let config = {
	model: Mesin,
	PK: "kode_mesin",
	whereCondition: { status: "true" }
};

const wipeData = () => {
	config = {
		model: Mesin,
		PK: "kode_mesin",
		whereCondition: { status: "true" }
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
	whereCondition = config.whereCondition
	config.limit = req.query.limit
	config.page = req.query.page
	config.whereCondition = whereCondition

	await utils.GetData(config, res)
};
const getSearch = async (req, res) => {

	wipeData()

	let whereCondition = Object.fromEntries(
		Object.entries(req.query).filter(
			([key, value]) => key != "limit" && key != "page" && key != "search"
		)
	);
	config.input = req.query.search
	config.limit = req.query.limit
	config.page = req.query.page
	config.whereCondition = whereCondition
	await utils.GetData(config, res)

}
// GET BY KODE
const getByKode = async (req, res) => {

	wipeData()

	config.byPK = req.params.kode_mesin
	await utils.GetData(config, res)

};
// CREATE MESIN
const createMesin = async (req, res) => {

	wipeData()

	// PAYLOAD
	const { kode_mesin, nama_mesin, keterangan, tgl_beli, supplier } = req.body;
	// VALIDASI
	let validate = await utils.Validate(req, res, [])
	if(validate) return validate

	let check = [
		{
			model: Mesin,
			whereCondition: { 
				kode_mesin: kode_mesin,
			},
			title: "Kode Mesin",
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
			kode_mesin: kode_mesin.toString(),
			nama_mesin: nama_mesin.toString(),
			keterangan: keterangan ?? "",
			tgl_beli: tgl_beli ?? "",
			supplier: supplier ?? "",
			created_by: req.session.user,
			created_date: new Date().toISOString(),
			deleted_by: "",
			deleted_date: new Date(1).toISOString(),
			status: "true",
		}
		config.log = [
			{
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Menambahkan data mesin",
					keterangan: kode_mesin,
					kode_user: req.session.user,
				}
			},
			{
				model: LogMesin,
				data: {
					tanggal: new Date(),
					kode_mesin: kode_mesin,
					kategori: "masuk",
					keterangan: kode_mesin,
					user_input: req.session.user
				},
			},
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
const editMesin = async (req, res) => {

	wipeData()

	const kode = req.params.kode;
	const { nama_mesin, keterangan, tgl_beli, supplier } = req.body;
	// VALIDASI
    let check = [
		{
			model: Mesin,
			whereCondition: {kode_mesin: kode, status: "true"},
			title: "Role",
			check: "isAvailable",
		},
	];
    let validate = await utils.Validate(req, res, check)
	if(validate) return validate
	// START TRANSACTION
	const transaction = await sequelize.transaction();
	try {
		const mesin = await Mesin.findOne({ where: { kode_mesin: kode, status: "true" }})
		config.data = {
			kode_mesin: kode,
			nama_mesin: nama_mesin ?? mesin.nama_mesin,
			keterangan: keterangan ?? mesin.keterangan,
			tgl_beli: tgl_beli ?? mesin.tgl_beli,
			supplier: supplier ?? mesin.supplier,
		}
		config.log = [
			{
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Mengubah data mesin",
					keterangan: kode,
					kode_user: req.session.user,
				}
			}
		]
		console.log(config);
		await utils.UpdateData(req, config, transaction)
		// COMMIT
		await transaction.commit();
		// RESULT
		res.status(201).json({
			status: "success",
			code: 201,
			message: ["Mesin berhasil diupdate"],
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
const deleteMesin = async (req, res) => {

	wipeData()

	const kode = req.params.kode;
	// START TRANSACTION
	const transaction = await sequelize.transaction();
	try {
		config.data = {
			kode_mesin: kode,
			deleted_by: req.session.user,
            deleted_date: new Date().toISOString(),
            status: "false"
		}
		config.log = [
			{
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Menghapus data mesin",
					keterangan: kode,
					kode_user: req.session.user,
				}
			}
		]
		let deleteLog = await utils.UpdateData(req, config, transaction)
		if(deleteLog.error) throw deleteLog.error
		// COMMIT
        await transaction.commit()
		// RESULT
        res.status(201).json({
			status: "success",
			code: 201,
			message: ["Berhasil menghapus data"],
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
	createMesin,
	editMesin,
	deleteMesin,
};
