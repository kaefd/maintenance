const { Op } = require("sequelize");
const Penyesuaian = require("../models/penyesuaianModel");
const LogSparepartModel = require("../models/logSparepartModel");
const { formaterPK } = require("../utils/utils");
const sequelize = require("../../connect");
const utils = require("./utils");
const Sparepart = require("../models/sparepartModel");
const LogUser = require("../models/logUser");

// BASE CONFIGURATION
let config = {
	model: Penyesuaian,
	PK: "no_penyesuaian",
	order: [["no_penyesuaian", "DESC"]],
	whereCondition: { status: "true" }
};

const wipeData = () => {
	config = {
		model: Penyesuaian,
		PK: "no_penyesuaian",
		order: [["no_penyesuaian", "DESC"]],
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

	config.input = req.query.search
	await utils.GetData(config, res)
	
}
// GET PENYESUAIAN BY NO
const getByKode = async (req, res) => {
	const no_penyesuaian = req.params.no_penyesuaian;
	try {
		const penyesuaian = await Penyesuaian.findByPk(no_penyesuaian);
		if (!penyesuaian) {
			return res.status(404).json({
				status: "error",
				code: 404,
				message: ["No penyesuaian tidak ditemukan"]
			});
		}
		// RESPONSE
		res.status(200).json({
			status: "success",
			code: 200,
			data: penyesuaian,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: error|| ["Internal server error"],
		});
	}
};
// CREATE PENYESUAIAN
const createPenyesuaian = async (req, res) => {

	wipeData()

	// PAYLOADS
	const { kode_sparepart, kategori, keterangan, jumlah, nilai_total } = req.body;
	// VALIDASI
	let validate = await utils.Validate(req, res, [])
	if(validate) return validate

	let check = [
		{
			model: Sparepart,
			whereCondition: { 
				kode_sparepart: kode_sparepart,
				status: "true"
			},
			title: "Kode Sparepart",
			check: "isAvailable",
			message: "Kode Sparepart belum terdaftar"
		},
		{
			model: Sparepart,
			whereCondition: { 
				kode_sparepart: kode_sparepart,
				status: "true"
			},
			parameter: ["stok_akhir", jumlah],
			title: "Kode Sparepart",
			check: kategori == "Barang keluar" ? ">=" : ""
		},
		{
			title: "Kategori",
			kategori: ["Barang masuk", "Barang keluar"],
			value: kategori,
			check: "byCategories"
		},
	];
	validate = await utils.Validate(req, res, check)
	if(validate) return validate
	// START TRANSACTION
	const transaction = await sequelize.transaction()
	try {
		const no_penyesuaian = await formaterPK("penyesuaian");
		const log = await LogSparepartModel.findOne({
			limit: 1,
			where: {
				kode_sparepart: kode_sparepart,
			},
			order: [["id_log_sparepart", "DESC"]],
		});
		const data_sparepart = await Sparepart.findOne({ where: { kode_sparepart: kode_sparepart, status: 'true' }})
		const nilai = data_sparepart.harga_satuan
		let mess = kategori == "Barang masuk" ? "Menambah data barang masuk penyesuaian stok" : "Menambah data barang keluar penyesuaian stok"
		let stok_awal = !log ? "" : log.stok_akhir;
		let nilai_awal = !log ? "" : log.nilai_akhir;
		const s_awal = stok_awal != "" ? stok_awal : 0
		const n_awal = nilai_awal != "" ? nilai_awal : 0
		const s_masuk = kategori == "Barang masuk" ? Number(jumlah) : 0
		const n_masuk = kategori == "Barang masuk" ? (nilai_total ?? (Number(nilai) * jumlah)) : 0
		const s_keluar = kategori == "Barang masuk" ?  0 : Number(jumlah)
		const n_keluar = kategori == "Barang masuk" ?  0 : (nilai_total ?? (log.nilai_akhir/log.stok_akhir*jumlah))
		const stok_akhir = kategori == "Barang masuk" ? (stok_awal != "" ? stok_awal + Number(jumlah) : Number(jumlah)) : stok_awal - Number(jumlah);
		const nilai_akhir = kategori == "Barang masuk" ? n_awal + n_masuk : n_awal - n_keluar
		config.data = {
			no_penyesuaian: no_penyesuaian,
			tgl_penyesuaian: new Date(),
			kode_sparepart: kode_sparepart,
			kategori: kategori,
			keterangan: keterangan ?? "",
			jumlah: jumlah,
			nilai: nilai_total ?? (kategori == "Barang masuk" ? n_masuk : n_keluar),
			status: "true",
		}
		config.time_user_stamp = true
		config.log = [
			{
				model: LogSparepartModel,
				data: {
					tanggal: new Date(),
					kode_sparepart: kode_sparepart,
					kategori: kategori,
					keterangan: no_penyesuaian,
					stok_awal: s_awal,
					nilai_awal: n_awal,
					stok_masuk: s_masuk,
					nilai_masuk: n_masuk,
					stok_keluar: s_keluar,
					nilai_keluar: n_keluar,
					stok_akhir: stok_akhir,
					nilai_akhir: nilai_akhir
				}
			},
			{
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: mess,
					keterangan: no_penyesuaian,
					username: req.session.user,
				}
			}
		]
		// POST DATA
		const result = await utils.CreateData(req, config, transaction)
		if(result.error) throw result.error

		
		// UPDATE STOK SPAREPART
		if(kategori == "Barang masuk") {

			wipeData()
			const n_satuan = nilai_total ? nilai_total/jumlah : nilai
			// const harga_satuan = (Number(data_sparepart.dataValues.harga_satuan) + Number(nilai))/2
			config.model = Sparepart
			config.PK = "kode_sparepart"
			config.data = {
				kode_sparepart: kode_sparepart,
				stok_akhir: stok_akhir,
				harga_satuan: n_satuan
			}
			// POST DATA
			const updateStok = await utils.UpdateData(req, config, transaction)
			if(updateStok.error) throw updateStok.error
		}
		// COMMIT
		await transaction.commit()
		res.status(201).json({
			status: "success",
			message: [mess],
			code: 201,
			data: result,
		});
	} catch (error) {
		await transaction.rollback()
		res.status(500).json({
			status: "error",
			code: 500,
			message: error ?? ["Internal server error"],
		});
	}
};
// BATAL PENYESUAIAN
const deletePenyesuaian = async (req, res) => {

	wipeData()

	// PARAM
	const kode = req.params.kode;
	const penyesuaian = await Penyesuaian.findOne({
		where: {
			no_penyesuaian: kode,
			status: "true"
		}
	});
	// START TRANSACTION
	const transaction = await sequelize.transaction()
	try {
		config.data = {
			no_penyesuaian: kode,
			deleted_date: new Date(),
			deleted_by: req.session.user,
			status: "false",
		}
		config.log = [
			{
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Membatalkan penyesuaian stok",
					keterangan: kode,
					username: req.session.user,
				}
			}
		]
		// POST DATA
		const result = await utils.UpdateData(req, config, transaction)
		if(result.error) throw result.error

		// DATA STOK AKHIR
		const StokByKode = await LogSparepartModel.findOne({
			limit: 1,
			where: {
				kode_sparepart: {
					[Op.eq]: penyesuaian.kode_sparepart,
				},

			},
			order: [["id_log_sparepart", "DESC"]],
		});
		const s_awal = StokByKode.stok_akhir
		const n_awal = StokByKode.nilai_akhir
		const nilai = StokByKode.nilai_akhir/StokByKode.stok_akhir
		const s_masuk = penyesuaian.kategori == "Barang masuk" ? 0 : Number(penyesuaian.jumlah)
		const n_masuk = penyesuaian.kategori == "Barang masuk" ? 0 : nilai * penyesuaian.jumlah
		const s_keluar = penyesuaian.kategori == "Barang masuk" ? Number(penyesuaian.jumlah) : 0
		const n_keluar = penyesuaian.kategori == "Barang masuk" ? nilai * penyesuaian.jumlah : 0
		const stok_akhir = penyesuaian.kategori == "Barang masuk" ? (s_awal - penyesuaian.jumlah) : (s_awal + penyesuaian.jumlah)
		const n_akhir = penyesuaian.kategori == "Barang masuk" ? (n_awal - n_keluar) : (n_awal + n_masuk)

		if(stok_akhir < 0 && penyesuaian.kategori == "Barang keluar" ) throw [`Stok ${StokByKode.kode_sparepart} tidak mencukupi`]

		wipeData()
		
		config.model = LogSparepartModel,
		config.PK = "id_log_sparepart"
		config.data = {
			tanggal: new Date(),
			kode_sparepart: StokByKode.kode_sparepart,
			keterangan: kode,
			kategori: penyesuaian.kategori == "Barang masuk" ? "Batal masuk" : "Batal keluar",
			stok_awal: s_awal,
			nilai_awal: n_awal,
			stok_masuk: s_masuk,
			nilai_masuk: n_masuk,
			stok_keluar: s_keluar,
			nilai_keluar: n_keluar,
			stok_akhir: stok_akhir,
			nilai_akhir: n_akhir
		}

		let updtStokSp = await utils.CreateData(req, config, transaction)
		if(updtStokSp.error) throw updtStokSp

		wipeData()

		// UPDATE STOK SPAREPART
		config.model = Sparepart
		config.PK = "kode_sparepart"
		config.data = {
			kode_sparepart: StokByKode.kode_sparepart,
			stok_akhir: stok_akhir
		}
		// POST DATA
		const updateStok = await utils.UpdateData(req, config, transaction)
		if(updateStok.error) throw updateStok.error
			
		// COMMIT
		await transaction.commit()
		// RESPONSE
		res.status(201).json({
			status: "success",
			code: 201,
			message: ["Data berhasil dibatalkan"],
		});
	} catch (error) {
		await transaction.rollback()
		res.status(500).json({
			status: "error",
			code: 500,
			message: error ?? ["gagal menambahkan data"],
		});
	}
};

module.exports = {
	getAll,
	getSearch,
	getByKode,
	createPenyesuaian,
	deletePenyesuaian,
};