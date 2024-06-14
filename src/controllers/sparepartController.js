const { Op } = require('sequelize')
const { validationResult } = require('express-validator');
const Sparepart = require('../models/sparepartModel')
const logUser = require('./logUserController')
const sequelize = require('../../connect');
const LogUser = require('../models/logUser');
const utils = require("./utils");
const LogSparepartModel = require('../models/logSparepartModel');

// BASE CONFIGURATION
let config = {
	model: Sparepart,
	PK: "kode_sparepart",
	whereCondition: { status: "true" }
};

const wipeData = () => {
	config = {
		model: Sparepart,
		PK: "kode_sparepart",
		whereCondition: { status: "true" }
	}
}

// GET ALL SPAREPART & PARAM
const getAll = async (req, res) => {

    wipeData()
    
    let whereCondition = Object.fromEntries(
		Object.entries(req.query).filter(
			([key, value]) => key != "limit" && key != "page"
		)
	);
	whereCondition = config.whereCondition
	config.limit = req.query.limit
	config.page = req.query.page
	config.whereCondition = whereCondition

	await utils.GetData(config, res)
}
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
// GET SPAREPART BY KODE
const getByKode = async (req, res) => {

    wipeData()

	config.byPK = req.params.kode_sparepart
	await utils.GetData(config, res)
}
// CREATE SPAREPART
const createSparepart = async (req, res) => {

    wipeData()

    // PAYLOADS
    const { kode_sparepart, nama_sparepart, merk, tipe, jumlah, harga_beli, stok_minus } = req.body
    // VALIDASI
    let validate = await utils.Validate(req, res, [])
	if(validate) return validate

    let check = [
        {
			model: Sparepart,
			whereCondition: { 
				kode_sparepart: kode_sparepart,
			},
			title: "Kode Sparepart",
			check: "isDuplicate",
		},
    ]
    validate = await utils.Validate(req, res, check)
	if(validate) return validate
    // START TRANSACTION
    const transaction = await sequelize.transaction()
    // CREATE DATA
    try {
        let harga = harga_beli ?? 0
        let stok = stok_minus ?? 0

        config.time_user_stamp = true
        config.data = {
            kode_sparepart: kode_sparepart ?? "",
            nama_sparepart: nama_sparepart ?? "",
            merk: merk ?? "",
            tipe: tipe ?? "",
            satuan: "PCS",
            harga_beli: harga,
            stok_minus: stok,
            stok_akhir: jumlah ?? 0,
            status: "true"
        }
        config.log = [
            {
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Menambahkan data sparepart",
					keterangan: kode_sparepart,
					kode_user: req.session.user,
				}
			},
            {
                model: LogSparepartModel,
                data: {
                    tanggal: new Date(),
                    kode_sparepart: kode_sparepart,
                    kategori: "Barang masuk",
                    keterangan: kode_sparepart,
                    stok_awal: 0,
                    stok_masuk: jumlah,
                    stok_keluar: 0,
                    stok_akhir: jumlah

                }
            }
        ]
        // POST DATA
		const result = await utils.CreateData(req, config, transaction)
		if(result.error) throw result.error

        // COMMIT
        await transaction.commit()
        // RESPOSNSE
        res.status(201).json({
			status: "success",
			code: 201,
			message: ["Berhasil menambahkan data"],
			data: result,
		});
    } catch (error) {
        await transaction.rollback()
        res.status(500).json({
			status: "error",
			code: 500,
			message: error ?? ["Internal Server Error"],
		});
    }
}
// EDIT SPAREPART
const editSparepart = async (req, res) => {

    wipeData()
    
    // PAYLOADS
    const kode = req.params.kode
    const { nama_sparepart, merk, tipe, satuan, harga_beli, stok_minus } = req.body
    // VALIDASI
    let check = [
		{
			model: Sparepart,
			whereCondition: {kode_sparepart: kode, status: "true"},
			title: "Kode Sparepart",
			check: "isAvailable",
		},
	];
    let validate = await utils.Validate(req, res, check)
	if(validate) return validate
    // START TRANSACTION
    const transaction = await sequelize.transaction()
    try {
        let sparepart = await Sparepart.findByPk(kode)
        config.data = {
            kode_sparepart: kode,
            nama_sparepart: nama_sparepart ?? sparepart.nama_sparepart,
            merk: merk ?? sparepart.merk,
            tipe: tipe ?? sparepart.tipe,
            satuan: satuan ?? sparepart.satuan,
            harga_beli: harga_beli ?? sparepart.harga_beli,
            stok_minus: stok_minus ?? sparepart.stok_minus,
        }
        config.log = [
            {
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Mengubah data sparepart",
					keterangan: kode,
					kode_user: req.session.user,
				}
			}
        ]
        await utils.UpdateData(req, config, transaction)
        // COMMIT
        await transaction.commit()
        // RESPONSE
        res.status(201).json({
			status: "success",
			code: 201,
            message: ["Sparepart berhasil diupdate"],
		});
    } catch (error) {
        await transaction.rollback()
        res.status(500).json({
			status: "error",
			code: 500,
			message: error ?? ["Internal Server Error"],
		});
    }
}
// DELETE SPAREPART
const deleteSparepart = async (req, res) => {

    wipeData()

    // GET PARAMS
    const kode = req.params.kode
    // START TRANSACTION
    const transaction = await sequelize.transaction()
    try {
        config.data = {
            kode_sparepart: kode,
            deleted_by: req.session.user,
            deleted_date: new Date().toISOString(),
            status: "false"
        }
        config.log = [
            {
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Menghapus data sparepart",
					keterangan: kode,
					kode_user: req.session.user,
				}
			}
        ]
        let deleteLog = await utils.UpdateData(req, config, transaction)
		if(deleteLog.error) throw deleteLog.error
        // COMMIT
        await transaction.commit()
        // RESPONSE
        res.status(201).json({
			status: "success",
			code: 201,
			message: ["Data berhasil dihapus"],
		});
    } catch (error) {
        await transaction.rollback()
        res.status(500).json({
			status: "error",
			code: 500,
			message: error ?? ["gagal menghapus data"],
		});
    }
}

module.exports = {
    getAll,
    getSearch,
    getByKode,
    createSparepart,
    editSparepart,
    deleteSparepart
}