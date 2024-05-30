const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
const Penyesuaian = require("../models/penyesuaianModel");
const LogSparepartModel = require("../models/logSparepartModel");
const logUser = require("./logUserController");
const { formaterPK } = require("../utils/utils");
const sequelize = require("../../connect");
const Sparepart = require("../models/sparepartModel");
const stokSparepart = require("../controllers/stokSparepart")

// GET ALL
const getAll = async (req, res) => {
	const { limit = 10, page = 1 } = req.query;
	const offset = (page - 1) * limit;
	try {
		let whereCondition = {};
		if (req.query.no_penyesuaian) {
			whereCondition.no_penyesuaian = {
				[Op.like]: `%${req.query.no_penyesuaian}`,
			};
		}
		whereCondition.status = "true";
		const penyesuaian = await Penyesuaian.findAll({
			limit: parseInt(limit),
			offset: parseInt(offset),
			where: whereCondition,
			order: [["no_penyesuaian", "DESC"]],
		});
		const total = await Penyesuaian.findAll({
			where: {
				status: "true",
			},
		})
		if (!penyesuaian) {
			return res.status(404).json({
				status: "error",
				code: 404,
				message: ["data tidak ditemukan"]
			});
		}
		var re = page > 1 ? total - (page * limit - limit) -  penyesuaian.length : total.length - penyesuaian.length
		// RESPONSE
		res.status(200).json({
			status: "success",
			code: 200,
			page: parseInt(page),
			limit: parseInt(limit),
			rows: penyesuaian.length,
			totalData: total.length,
			remainder: re || 0,
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
const getSearch = async (req, res) => {
	const input = req.query.search
	try {
		let pny = await Penyesuaian.findAll({
			where: {
				status: "true",
			},
			order: [["no_penyesuaian", "DESC"]],
		})
		if (!pny) return res.status(404).json({
			status: "error",
			code: 404,
			message: ["data tidak ditemukan"]
		});
		console.log('pny');
		let nwpny = pny.map(i => i.dataValues)
		const search = input ? nwpny.filter(item => Object.values(item).some(value => typeof value == 'string' && value.toLowerCase().includes(input.toLowerCase()))) : pny
		console.log(search);
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
	// PAYLOADS
	const { tgl_penyesuaian, kode_sparepart, kategori, keterangan, jumlah } = req.body;
	// VALIDASI
	let errors = validationResult(req).array().map(er => { return er.msg || er.message })
	if (errors != "") return res.status(400).json({
		status: "error",
		code: 400,
		message: errors
	});
	if(kategori != "Barang masuk" && kategori != 'Barang keluar') return res.status(400).json({
		status: "error",
		code: 400,
		message: ["Kategori salah"]
	});
	// START TRANSACTION
	const transaction = await sequelize.transaction()
	// POST PNY
	try {
		const no_penyesuaian = await formaterPK("penyesuaian");
		const newPenyesuaian = await Penyesuaian.create({
			no_penyesuaian: no_penyesuaian,
			tgl_penyesuaian: tgl_penyesuaian,
			kode_sparepart: kode_sparepart,
			kategori: kategori.toString(),
			keterangan: keterangan.toString(),
			jumlah: Number(jumlah),
			created_by: req.session.user,
			created_date: new Date().toISOString(),
			deleted_by: "",
			deleted_date: new Date(1).toISOString(),
			status: "true",
		},
		{ transaction: transaction });
		// CEK SPAREPART
		const sp = await Sparepart.findOne({
			where: {
				kode_sparepart: kode_sparepart
			}
		})
		if(!sp) throw [`${kode_sparepart} belum terdaftar`]
		// NILAI STOK AKHIR
		const log = await LogSparepartModel.findOne({
			limit: 1,
			where: {
				kode_sparepart: kode_sparepart,
			},
			order: [["id_log_sparepart", "DESC"]],
		});
		let stok_awal = !log ? "" : log.stok_akhir;
		let mess = "";
		// POST DATA
		if (kategori == "Barang masuk") {
			// POST LOG SPAREPART
			const stok_akhir = stok_awal != "" ? stok_awal + Number(jumlah) : Number(jumlah);
			const s_awal = stok_awal != "" ? stok_awal : 0
			const s_masuk = Number(jumlah)
			const s_keluar = 0
			await LogSparepartModel.create({
				tanggal: new Date().toISOString(),
				kode_sparepart: kode_sparepart,
				keterangan: keterangan.toString(),
				kategori: "Barang masuk",
				keterangan: no_penyesuaian,
				stok_awal: s_awal,
				stok_masuk: s_masuk,
				stok_keluar: s_keluar,
				stok_akhir: stok_akhir
			},
			{ transaction: transaction });
			// UPDATE STOK
			let updtStokSp = await stokSparepart.updateStok(kode_sparepart, stok_akhir, transaction)
			if(updtStokSp.error) throw updtStokSp
			// CREATE LOG USER
			mess = "Menambah data barang masuk penyesuaian stok"
			const log_user = await logUser.createLog(
				mess,
				no_penyesuaian,
				req.session.user,
				transaction
			);
			if (log_user.error) throw [log_user.error];
		}
		if (kategori == "Barang keluar") {
			// VALIDASI
			if (stok_awal == "") throw [`Stok ${kode_sparepart} kosong`]
			
			const stok_akhir = stok_awal - Number(jumlah);
			if (stok_akhir < 0) throw [`Stok akhir ${kode_sparepart} tidak mecukupi`]

			const s_masuk = 0
			const s_keluar = Number(jumlah)
			// POST LOG SPAREPART
			await LogSparepartModel.create({
				tanggal: new Date().toISOString(),
				kode_sparepart: kode_sparepart,
				kategori: "Barang keluar",
				keterangan: no_penyesuaian,
				stok_awal: stok_awal,
				stok_masuk: s_masuk,
				stok_keluar: s_keluar,
				stok_akhir: stok_akhir
			},
			{ transaction: transaction });
			// UPDATE STOK
			let updtStokSp = await stokSparepart.updateStok(kode_sparepart, stok_akhir, transaction)
			if(updtStokSp.error) throw updtStokSp
			// CREATE LOG USER
			mess = "Menambah data barang keluar penyesuaian stok"
			const log_user = await logUser.createLog(
				mess,
				no_penyesuaian,
				req.session.user,
				transaction
			);
			if (log_user.error) throw log_user.error;
		}
		// COMMIT
		await transaction.commit()
		res.status(201).json({
			status: "success",
			message: [mess],
			code: 201,
			data: newPenyesuaian,
		});
	} catch (error) {
		await transaction.rollback()
		res.status(500).json({
			status: "error",
			code: 500,
			message: error|| ["Internal server error"],
		});
	}
};
// BATAL PENYESUAIAN
const deletePenyesuaian = async (req, res) => {
	// PARAM
	const kode = req.params.kode;
	const penyesuaian = await Penyesuaian.findByPk(kode);
	// VALIDASI
	if (!penyesuaian) return res.status(404).json({
		status: "error",
		code: 404,
		message: ["No penyesuaian tidak ditemukan"]
	});
	if(penyesuaian.kategori != "Barang masuk" && penyesuaian.kategori != "Barang keluar") return res.status(500).json({
		status: "error",
		code: 500,
		message: ["Gagal menghapus data"]
	});
	// START TRANSACTION
	const transaction = await sequelize.transaction()
	try {
		// UPDATE VALUE
		const updt = await penyesuaian.update({
			deleted_date: new Date(),
			deleted_by: req.session.user,
			status: "false",
		},
		{ transaction: transaction });
		updt.save()
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
		if (penyesuaian.kategori == "Barang masuk") {
			const s_awal = StokByKode.stok_akhir
			const stok_akhir = s_awal - penyesuaian.jumlah
			const s_masuk = 0
			const s_keluar = Number(penyesuaian.jumlah)

			if(stok_akhir < 0 ) throw [`Stok ${StokByKode.kode_sparepart} tidak mencukupi`]
			await LogSparepartModel.create({
				tanggal: new Date().toISOString(),
				kode_sparepart: StokByKode.kode_sparepart,
				keterangan: kode,
				kategori: "Batal masuk",
				stok_awal: s_awal,
				stok_masuk: s_masuk,
				stok_keluar: s_keluar,
				stok_akhir: stok_akhir
			},
			{ transaction: transaction });
			let updtStokSp = await stokSparepart.updateStok(StokByKode.kode_sparepart, stok_akhir, transaction)
			if(updtStokSp.error) throw updtStokSp
			
		}
		if(penyesuaian.kategori == "Barang keluar") {
			const s_awal = StokByKode.stok_akhir
			const stok_akhir = s_awal + penyesuaian.jumlah
			const s_masuk = Number(penyesuaian.jumlah)
			const s_keluar = 0
			await LogSparepartModel.create({
				tanggal: new Date().toISOString(),
				kode_sparepart: StokByKode.kode_sparepart,
				keterangan: kode,
				kategori: "Batal keluar",
				stok_awal: s_awal,
				stok_masuk: s_masuk,
				stok_keluar: s_keluar,
				stok_akhir: stok_akhir
			},
			{ transaction: transaction });
			let updtStokSp = await stokSparepart.updateStok(StokByKode.kode_sparepart, stok_akhir, transaction)
			if(updtStokSp.error) throw updtStokSp
		}
		// POST LOG USER
		// CREATE LOG USER
		const log_user = await logUser.createLog(
			"Membatalkan data penyesuaian stok",
			penyesuaian.no_penyesuaian,
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
			message: ["Data berhasil dibatalkan"],
		});
	} catch (error) {
		await transaction.rollback()
		res.status(500).json({
			status: "error",
			code: 500,
			message: error || ["gagal menambahkan data"],
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