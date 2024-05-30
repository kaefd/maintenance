const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
const utils = require("../utils/utils")
const DetailMasalah = require("../models/detailMasalahModel");
const LogSparepart = require("../models/logSparepartModel");
const LogUser = require("../models/logUser");
const logSparepart = require("../controllers/logSparepartController");
const stokSparepart = require("../controllers/stokSparepart");
const sequelize = require("../../connect");
const Sparepart = require("../models/sparepartModel");
const LogSparepartModel = require("../models/logSparepartModel");

// GET ALL
const getAll = async (req, res) => {
	// MODEL ASSOSIATION
	Sparepart.hasMany(DetailMasalah, {foreignKey: 'kode_sparepart'})
	DetailMasalah.belongsTo(Sparepart, {foreignKey: 'kode_sparepart'})
	const { limit = 10, page = 1 } = req.query;
	const offset = (page - 1) * limit;
	try {
		let whereCondition = {};
		if (req.query.no_masalah) {
			whereCondition.no_masalah = req.query.no_masalah
		}
		if (req.query.kode_sparepart) {
			whereCondition.kode_sparepart = req.query.kode_sparepart
		}
		let d_masalah = await DetailMasalah.findAll({
			limit: parseInt(limit),
			offset: parseInt(offset),
			where: whereCondition,
			include: [{
                model: Sparepart,
                required: true,
                attributes: ['nama_sparepart']
            }]
		});
		if (d_masalah == '') return res.status(404).json({
			status: "error",
			code: 404,
			message: "data tidak ditemukan"
		});
		// new obj
		const new_detail = d_masalah.map(d => { return {
			no_masalah: d.no_masalah,
			no_urut: d.no_urut,
			kode_sparepart: d.kode_sparepart,
			nama_sparepart: d.Sparepart.nama_sparepart,
			jumlah: d.jumlah,
			keterangan: d.keterangan
		}})
		const total = await DetailMasalah.findAll({
			where: whereCondition,
		})
		var re = page > 1 ? total.length - (page * limit - limit) -  new_detail.length : total.length - new_detail.length
		// RESPONSE
		res.status(200).json({
			status: "success",
			code: 200,
			page: parseInt(page),
			limit: parseInt(limit),
			rows: new_detail.length,
			totalData: total.length,
			remainder: re || 0,
			data: new_detail,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: error|| ["Internal server error"],
		});
	}
};
// GET
const getByKode = async (req, res) => {
	// MODEL ASSOSIATION
	Sparepart.hasMany(DetailMasalah, {foreignKey: 'kode_sparepart'})
	DetailMasalah.belongsTo(Sparepart, {foreignKey: 'kode_sparepart'})
	// PARAM
	const no_masalah = req.params.no_masalah;
	try {
		let d_masalah = await DetailMasalah.findAll({
			where: {
				no_masalah: no_masalah
			},
			include: [{
                model: Sparepart,
                required: true,
                attributes: ['nama_sparepart']
            }]
		});
		if (!d_masalah) {
			return res.status(404).json({
				status: "error",
				code: 404,
				message: "data tidak ditemukan"
			});
		}
		// new obj
		const new_detail = d_masalah.map(item => {
			return {
				no_masalah: item.no_masalah,
				no_urut: item.no_urut,
				kode_sparepart: item.kode_sparepart,
				nama_sparepart: item.Sparepart.nama_sparepart,
				jumlah: item.jumlah,
				keterangan: item.keterangan
			}
		})
		// RESPONSE
		res.status(200).json({
			status: "success",
			code: 200,
			page: 1,
			limit: new_detail.length,
			rows: new_detail.length,
			totalData: new_detail.length,
			remainder: 0,
			data: new_detail,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: error|| ["Internal server error"],
		});
	}
};
// CREATE DETAIL MASALAH
const createDetailMasalah = async (no_masalah, detail, transaction) => {
	try {
		let data = []
		let  p = ''
		// VALIDASI
		for (let i = 0; i < detail.length; i++) {
			if(detail[i].kode_sparepart == undefined || detail[i].kode_sparepart == '' || detail[i].kode_sparepart.kode_sparepart == 0) throw ['kode sparepart tidak boleh kosong']
			if(detail[i].jumlah == undefined || detail[i].jumlah == '' || detail[i].jumlah.jumlah == 0) throw [`jumlah ${detail[i].kode_sparepart} tidak boleh kosong`]
			// if(typeof detail[i].jumlah != "number") throw `jumlah ${detail[i].kode_sparepart} harus berupa angka`
			if(detail[i].keterangan == undefined || detail[i].keterangan == '' || detail[i].keterangan.keterangan == 0) throw [`keterangan ${detail[i].kode_sparepart} tidak boleh kosong`]
			if(utils.isDuplicated('kode_sparepart', detail[i].kode_sparepart, detail)) throw ['kode sparepart tidak boleh sama']
			// CHECK STOCK
			let log_sparepart = await LogSparepart.findOne({
				limit: 1,
				order: [["id_log_sparepart", "DESC"]],
				where: { kode_sparepart: detail[i].kode_sparepart }
			})
			if(log_sparepart == null || log_sparepart.stok_akhir - detail[i].jumlah < 0) throw `stok ${detail[i].kode_sparepart} tidak mencukupi`
		}
		for (let i = 0; i < detail.length; i++) {
			// KURANGI STOK SPAREPART
			// GET LAST ROW
			let log_sparepart = await LogSparepart.findOne({
				limit: 1,
				order: [["id_log_sparepart", "DESC"]],
				where: { kode_sparepart: detail[i].kode_sparepart }
			})
			let kategori = 'Barang keluar'
			let keterangan = no_masalah
			let stok_awal = log_sparepart.stok_akhir
			let stok_masuk = 0
			let stok_keluar = detail[i].jumlah
			let n_stok_akhir = log_sparepart.stok_akhir - detail[i].jumlah
			let post_sparepart = await logSparepart.createLog(detail[i].kode_sparepart, kategori, keterangan, stok_awal, stok_masuk, stok_keluar, n_stok_akhir, transaction)
			if(post_sparepart.error) throw post_sparepart
			let updtStokSp = await stokSparepart.updateStok(detail[i].kode_sparepart, n_stok_akhir, transaction)
			if(updtStokSp.error) throw updtStokSp
			// POST DETAIL
			p = await DetailMasalah.create({
				no_masalah: no_masalah,
				no_urut: i + 1,
				kode_sparepart: detail[i].kode_sparepart,
				jumlah: Number(detail[i].jumlah),
				keterangan: detail[i].keterangan,
				status: "true"
			}, { transaction: transaction })

			data.push(p)
		}
		return data
	} catch(err) {
		return { error: err }
	}
};
// DELETE DETAIL MASALAH
const deleteDetailMasalah = async (no_masalah, user, transaction) => {
	// CHECK DATA
	const data = await DetailMasalah.findAll({ where: {no_masalah: no_masalah} })
	if(data == "") return true
	// SESUAIKAN STOK
	// GET STOK SEMUA SPAREPART
	if(data != '') {
		for (let i = 0; i < data.length; i++) {
			// buat log
			const StokByKode = await LogSparepartModel.findOne({
				limit: 1,
				where: {
					kode_sparepart: {
						[Op.eq]: data[i].kode_sparepart,
					},
	
				},
				order: [["id_log_sparepart", "DESC"]],
			});
			const s_awal = StokByKode.stok_akhir
			const stok_akhir = s_awal + data[i].jumlah
			const s_masuk = Number(data[i].jumlah)
			const s_keluar = 0
			await LogSparepartModel.create({
				tanggal: new Date().toISOString(),
				kode_sparepart: data[i].kode_sparepart,
				keterangan: no_masalah,
				kategori: "Batal keluar",
				stok_awal: s_awal,
				stok_masuk: s_masuk,
				stok_keluar: s_keluar,
				stok_akhir: stok_akhir
			},
			{ transaction: transaction });
			let updtStokSp = await stokSparepart.updateStok(data[i].kode_sparepart, stok_akhir, transaction)
			if(updtStokSp.error) return updtStokSp
		}
		// delete detail
		const del = await DetailMasalah.destroy({ where: { no_masalah: no_masalah }, transaction: transaction });
		if(!del) return {error: ['gagal membatalkan detail masalah']}
	}
	// HAPUS DETAIL
	return {success: ['berhasil dibatalkan']}
}

module.exports = {
	getAll,
	getByKode,
	createDetailMasalah,
	deleteDetailMasalah
};
