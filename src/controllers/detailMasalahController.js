const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
const utils = require("../utils/utils")
const DetailMasalah = require("../models/detailMasalahModel");
const LogSparepart = require("../models/logSparepartModel");
const LogUser = require("../models/logUser");
const logSparepart = require("../controllers/logSparepartController");
const sequelize = require("../../connect");
const Sparepart = require("../models/sparepartModel");

// GET ALL
const getAll = async (req, res) => {
	// MODEL ASSOSIATION
	Sparepart.hasMany(DetailMasalah, {foreignKey: 'kode_sparepart'})
	DetailMasalah.belongsTo(Sparepart, {foreignKey: 'kode_sparepart'})
	try {
		let whereCondition = {};
		if (req.query.no_masalah) {
			whereCondition.no_masalah = req.query.no_masalah
		}
		if (req.query.kode_sparepart) {
			whereCondition.kode_sparepart = req.query.kode_sparepart
		}
		let d_masalah = await DetailMasalah.findAll({
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
		// RESPONSE
		res.status(200).json({
			status: "success",
			code: 200,
			data: new_detail,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: error|| "Internal server error",
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
		let d_masalah = await DetailMasalah.findOne({
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
		const new_detail = {
			no_masalah: d_masalah.no_masalah,
			no_urut: d_masalah.no_urut,
			kode_sparepart: d_masalah.kode_sparepart,
			nama_sparepart: d_masalah.Sparepart.nama_sparepart,
			jumlah: d_masalah.jumlah,
			keterangan: d_masalah.keterangan
		}
		// RESPONSE
		res.status(200).json({
			status: "success",
			code: 200,
			data: new_detail,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: error|| "Internal server error",
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
			console.log(typeof detail[i].jumlah);
			if(detail[i].kode_sparepart == undefined || detail[i].kode_sparepart == '' || detail[i].kode_sparepart.kode_sparepart == 0) throw 'kode sparepart tidak boleh kosong'
			if(detail[i].jumlah == undefined || detail[i].jumlah == '' || detail[i].jumlah.jumlah == 0) throw `jumlah ${detail[i].kode_sparepart} tidak boleh kosong`
			if(typeof detail[i].jumlah != "number") throw `jumlah ${detail[i].kode_sparepart} harus berupa angka`
			if(detail[i].keterangan == undefined || detail[i].keterangan == '' || detail[i].keterangan.keterangan == 0) throw `keterangan ${detail[i].kode_sparepart} tidak boleh kosong`
			if(utils.isDuplicated('kode_sparepart', detail[i].kode_sparepart, detail)) throw 'kode sparepart tida boleh sama'
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
	// SESUAIKAN STOK
	// GET STOK SEMUA SPAREPART
	if(data != '') {
		for (let i = 0; i < data.length; i++) {
			// kembalikan stok
			let log = await LogSparepart.findOne({
				where: {kode_sparepart: data[i].kode_sparepart},
				limit: 1,
				order: [["id_log_sparepart", "DESC"]],
			})
			log.update({
				stok_akhir: log.stok_akhir + data[i].jumlah
			}, { transaction: transaction })
			log.save()
			// hapus log
			await LogSparepart.destroy({ 
				where: {
					keterangan: data[i].no_masalah,
					kode_sparepart: data[i].kode_sparepart
				},
				transaction: transaction
			})
		}
		// delete detail
		const del = await DetailMasalah.destroy({ where: { no_masalah: no_masalah }, transaction: transaction });
		if(!del) return {error: 'gagal membatalkan detail masalah'}
	}
	// HAPUS DETAIL
	return {success: 'berhasil dibatalkan'}
}

module.exports = {
	getAll,
	getByKode,
	createDetailMasalah,
	deleteDetailMasalah
};
