const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
const Penyesuaian = require("../models/penyesuaianModel");
const LogSparepartModel = require("../models/logSparepartModel");
const logUser = require("./logUserController");
const { formaterPK } = require("../utils/utils");
const sequelize = require("../../connect");

// GET ALL
const getAll = async (req, res) => {
	try {
		let whereCondition = {};
		if (req.query.no_penyesuaian) {
			whereCondition.no_penyesuaian = {
				[Op.like]: `%${req.query.no_penyesuaian}`,
			};
		}
		whereCondition.status = "true";
		const penyesuaian = await Penyesuaian.findAll({
			where: whereCondition,
		});
		if (!penyesuaian) {
			return res.status(404).json({
				status: "error",
				code: 404,
				message: "data tidak ditemukan"
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
			message: error|| "Internal server error",
		});
	}
};
// GET PENYESUAIAN BY NO
const getByKode = async (req, res) => {
	const no_penyesuaian = req.params.no_penyesuaian;
	try {
		const penyesuaian = await Penyesuaian.findByPk(no_penyesuaian);
		if (!penyesuaian) {
			return res.status(404).json({
				status: "error",
				code: 404,
				message: "No penyesuaian tidak ditemukan"
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
			message: error|| "Internal server error",
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
		message: "Kategori salah"
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
		// NILAI STOK AKHIR
		const log = await LogSparepartModel.findOne({
			limit: 1,
			where: {
				kode_sparepart: kode_sparepart,
			},
			order: [["id_log_sparepart", "DESC"]],
		});
		// VALIDASI
		if(!log) throw `${kode_sparepart} belum terdaftar`
		let stok_awal = log != "" ? log.stok_akhir : "";
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
			// CREATE LOG USER
			const log_user = await logUser.createLog(
				"Menambah data barang masuk penyesuaian stok",
				no_penyesuaian,
				req.session.user,
				transaction
			);
			if (log_user.error) throw log_user.error;
		}
		if (kategori == "Barang keluar") {
			// VALIDASI
			if (stok_awal == "") throw `Stok ${kode_sparepart} kosong`
			
			const stok_akhir = stok_awal - Number(jumlah);
			if (stok_akhir < 0) throw `Stok akhir ${kode_sparepart} tidak mecukupi`

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
			// CREATE LOG USER
			const log_user = await logUser.createLog(
				"Menambah data barang keluar penyesuaian stok",
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
			code: 201,
			data: newPenyesuaian,
		});
	} catch (error) {
		await transaction.rollback()
		res.status(500).json({
			status: "error",
			code: 500,
			message: error|| "Internal server error",
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
		message: "No penyesuaian tidak ditemukan"
	});
	if(penyesuaian.kategori != "Barang masuk" && penyesuaian.kategori != "Barang keluar") return res.status(500).json({
		status: "error",
		code: 500,
		message: "Gagal menghapus data"
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
			// CEK STOK
			if (StokByKode.stok_akhir - penyesuaian.jumlah < 0) {
				throw `stok akhir ${penyesuaian.kode_sparepart} tidak mencukupi`
			}
			// UPDATE NILAI STOK AKHIR
			await StokByKode.update(
				{ stok_akhir: StokByKode.stok_akhir - penyesuaian.jumlah },
				{ transaction: transaction }
			);
			StokByKode.save();
			// HAPUS LOG SPAREPART LAMA
			await LogSparepartModel.destroy({
				where: {
					keterangan: penyesuaian.no_penyesuaian,
				},
				transaction: transaction
			});
		}
		if(penyesuaian.kategori == "Barang keluar") {
			// UPDATE NILAI STOK AKHIR
			await StokByKode.update(
				{ stok_akhir: StokByKode.stok_akhir + penyesuaian.jumlah },
				{ transaction: transaction }
			);
			StokByKode.save();
			// HAPUS LOG SPAREPART LAMA
			await LogSparepartModel.destroy({
				where: {
					keterangan: penyesuaian.no_penyesuaian,
				},
				transaction: transaction
			});
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
			message: "Data berhasil dibatalkan",
		});
	} catch (error) {
		await transaction.rollback()
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
	createPenyesuaian,
	deletePenyesuaian,
};