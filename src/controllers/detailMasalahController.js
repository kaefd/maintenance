const { Op } = require("sequelize");
const utils = require("./utils")
const DetailMasalah = require("../models/detailMasalahModel");
const LogSparepart = require("../models/logSparepartModel");
const Sparepart = require("../models/sparepartModel");
const LogSparepartModel = require("../models/logSparepartModel");

// BASE CONFIGURATION
let config = {
	model: DetailMasalah,
	PK: "no_masalah",
	modelAssociation: [
		{
			toModel: Sparepart,
			relation: "hasMany",
			model: DetailMasalah,
			fk: "kode_sparepart"
		},
		{
			toModel: DetailMasalah,
			relation: "belongsTo",
			model: Sparepart,
			fk: "kode_sparepart",
		},
	],
	order: [["no_masalah", "DESC"]],
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
		model: DetailMasalah,
		PK: "no_masalah",
		modelAssociation: [
			{
				toModel: Sparepart,
				relation: "hasMany",
				model: DetailMasalah,
				fk: "kode_sparepart"
			},
			{
				toModel: DetailMasalah,
				relation: "belongsTo",
				model: Sparepart,
				fk: "kode_sparepart",
			},
		],
		order: [["no_masalah", "DESC"]],
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

	config.byPK = req.params.no_masalah
	await utils.GetData(config, res)

};
// CREATE DETAIL MASALAH
const createDetailMasalah = async (no_masalah, detail, transaction) => {
	
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
			let kategori = 'Barang keluar'
			let keterangan = no_masalah
			let stok_awal = log_sparepart.stok_akhir
			let stok_masuk = 0
			let stok_keluar = detail[i].jumlah
			let n_stok_akhir = log_sparepart.stok_akhir - detail[i].jumlah
			let sparepart = await Sparepart.findByPk(detail[i].kode_sparepart)
			let harga_satuan = sparepart.dataValues.harga_beli / sparepart.dataValues.stok_akhir
			
			config.data = {
				no_masalah: no_masalah,
				no_urut: i + 1,
				kode_sparepart: detail[i].kode_sparepart,
				jumlah: Number(detail[i].jumlah),
				keterangan: detail[i].keterangan ?? "",
				biaya: harga_satuan * detail[i].jumlah,
				status: "true"
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
						stok_masuk: stok_masuk,
						stok_keluar: stok_keluar,
						stok_akhir: n_stok_akhir
					}
				},
			]
			const result = await utils.CreateData(null, config, transaction)
			if(result.error) throw result.error

			wipeData()

			config.model = Sparepart
			config.PK = "kode_sparepart"

			config.data = {
				kode_sparepart: sparepart.dataValues.kode_sparepart,
				stok_akhir: n_stok_akhir
			}

			
			console.log(config);
			const updateSparepart = await utils.UpdateData(null, config, transaction)
			if(updateSparepart.error) throw updateSparepart.error

			data.push(result)
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
			// let updtStokSp = await stokSparepart.updateStok(data[i].kode_sparepart, stok_akhir, transaction)
			// if(updtStokSp.error) return updtStokSp
			
			let stokSparepart = await Sparepart.findByPk(data[i].kode_sparepart)
			stokSparepart.update({
				stok_akhir: stok_akhir
			}, {transaction: transaction})
			stokSparepart.save()
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
