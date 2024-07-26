const { Op } = require("sequelize");
const utils = require("./utils")
const PenangananDetail = require("../models/detailMasalahModel");
const LogSparepart = require("../models/logSparepartModel");
const Sparepart = require("../models/sparepartModel");
const LogSparepartModel = require("../models/logSparepartModel");

// BASE CONFIGURATION
let config = {
	model: PenangananDetail,
	PK: "no_penanganan",
	modelAssociation: [
		{
			toModel: Sparepart,
			relation: "hasMany",
			model: PenangananDetail,
			fk: "kode_sparepart"
		},
		{
			toModel: PenangananDetail,
			relation: "belongsTo",
			model: Sparepart,
			fk: "kode_sparepart",
		},
	],
	order: [["no_penanganan", "DESC"]],
	include: [
		{ 
			model: Sparepart,
			strModel: "Sparepart",
            attributes: ['nama_sparepart']
		}
	],
}
const wipeData = async () => {
	config = {
		model: PenangananDetail,
		PK: "no_penanganan",
		modelAssociation: [
			{
				toModel: Sparepart,
				relation: "hasMany",
				model: PenangananDetail,
				fk: "kode_sparepart"
			},
			{
				toModel: PenangananDetail,
				relation: "belongsTo",
				model: Sparepart,
				fk: "kode_sparepart",
			},
		],
		order: [["no_penanganan", "DESC"]],
		include: [
			{ 
				model: Sparepart,
				strModel: "Sparepart",
				attributes: ['nama_sparepart']
			}
		],
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
	config.limit = req.query.limit
	config.page = req.query.page
	config.whereCondition = whereCondition
	await utils.GetData(config, res)
};
// GET
const getByKode = async (req, res) => {
	
	wipeData()

	config.whereCondition = {
		no_penanganan: req.params.no_penanganan
	}
	await utils.GetData(config, res)

};
// CREATE DETAIL MASALAH
const createPenangananDetail = async (no_penanganan, detail, transaction) => {
	
	wipeData()

	// VALIDATE
	let check = [
		{
			check: "isEmpty",
			data: detail,
			field: [
				{key: "kode_sparepart", title: "Kode Sparepart"},
				{key: "jumlah", title: "Jumlah"},
			]
		},
		{
			check: "isDuplicate",
			data: detail,
			field: [
				{key: "kode_sparepart", title: "Kode Sparepart"}
			]
		},
	]
	let validate = await utils.Validate(null, null, check)
	if(validate) return {error: validate.message}
	try {
		let data = []
		for (let i = 0; i < detail.length; i++) {
			let log_sparepart = await LogSparepart.findOne({
				limit: 1,
				order: [["id_log_sparepart", "DESC"]],
				where: { kode_sparepart: detail[i].kode_sparepart }
			})
			let sparepart = await Sparepart.findByPk(detail[i].kode_sparepart)
			// let harga_satuan = sparepart.harga_satuan * detail[i].jumlah
			if(!log_sparepart || detail[i].jumlah > log_sparepart.stok_akhir) throw `Stok ${detail[i].kode_sparepart} tidak mencukupi`
			let kategori = 'Barang keluar'
			let keterangan = no_penanganan
			let stok_awal = log_sparepart.stok_akhir
			let nilai_awal = log_sparepart.nilai_akhir
			let stok_masuk = 0
			let nilai_masuk = 0
			let stok_keluar = detail[i].jumlah
			let nilai_keluar = (log_sparepart.nilai_akhir/log_sparepart.stok_akhir) * detail[i].jumlah
			let n_stok_akhir = log_sparepart.stok_akhir - detail[i].jumlah
			let nilai_akhir = nilai_awal - nilai_keluar
			
			config.data = {
				no_penanganan: no_penanganan,
				no_urut: i + 1,
				kode_sparepart: detail[i].kode_sparepart,
				jumlah: Number(detail[i].jumlah),
				keterangan: detail[i].keterangan ?? "",
				nilai: nilai_keluar,
			}
			config.log = [
				{
					model: LogSparepart,
					data: {
						tanggal: new Date(),
						kode_sparepart: detail[i].kode_sparepart,
						kategori: kategori,
						keterangan: keterangan,
						stok_awal: stok_awal,
						nilai_awal: nilai_awal,
						stok_masuk: stok_masuk,
						nilai_masuk: nilai_masuk,
						stok_keluar: stok_keluar,
						nilai_keluar: nilai_keluar,
						stok_akhir: n_stok_akhir,
						nilai_akhir: nilai_akhir
					}
				},
			]
			const result = await utils.CreateData(null, config, transaction)
			if(result.error) throw result.error

			sparepart.update({
				stok_akhir: n_stok_akhir
			})
			sparepart.save()

			data.push(result)
		}
		console.log('data');
		console.log(data);
		return data
	} catch(err) {
		return { error: err }
	}
};
// DELETE DETAIL MASALAH
const deletePenangananDetail = async (no_penanganan, user, transaction) => {
	// CHECK DATA
	const data = await PenangananDetail.findAll({ where: {no_penanganan: no_penanganan} })
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
			const n_awal = StokByKode.nilai_akhir
			const s_masuk = Number(data[i].jumlah)
			const n_masuk = Number(data[i].nilai)
			const s_keluar = 0
			const n_keluar = 0
			const stok_akhir = s_awal + data[i].jumlah
			const nilai_akhir = n_awal + data[i].nilai
			await LogSparepartModel.create({
				tanggal: new Date(),
				kode_sparepart: data[i].kode_sparepart,
				keterangan: no_penanganan,
				kategori: "Batal keluar",
				stok_awal: s_awal,
				nilai_awal: n_awal,
				stok_masuk: s_masuk,
				nilai_masuk: n_masuk,
				stok_keluar: s_keluar,
				nilai_keluar: n_keluar,
				stok_akhir: stok_akhir,
				nilai_akhir: nilai_akhir
			},
			{ transaction: transaction });
			// let updtStokSp = await stokSparepart.updateStok(data[i].kode_sparepart, stok_akhir, transaction)
			// if(updtStokSp.error) return updtStokSp
			
			let stokSparepart = await Sparepart.findByPk(data[i].kode_sparepart)
			stokSparepart.update({
				stok_akhir: stok_akhir
			}, {transaction: transaction})
			stokSparepart.save()
		}
		// delete detail
		const del = await PenangananDetail.destroy({ where: { no_penanganan: no_penanganan }, transaction: transaction });
		if(!del) return {error: ['gagal membatalkan detail penanganan']}
	}
	// HAPUS DETAIL
	return {success: ['berhasil dibatalkan']}
}

module.exports = {
	getAll,
	getByKode,
	createPenangananDetail,
	deletePenangananDetail
};
