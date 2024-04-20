const { Op } = require('sequelize')
const { validationResult } = require('express-validator');
const Sparepart = require('../models/sparepartModel')
const logUser = require('./logUserController')
const sequelize = require('../../connect');

// GET ALL SPAREPART & PARAM
const getAll = async (req, res) => {
    const { limit = 10, page = 1 } = req.query;
	const offset = (page - 1) * limit;
    try {
        const sparepart = await Sparepart.findAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
            where: {
                status: "true",
            }
        })
        if(!sparepart) {
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
			data: sparepart,
		});
    } catch (error) {
        res.status(500).json({
			status: "error",
			code: 500,
			message: error || "Internal server error",
		});
    }
}
// GET SPAREPART BY KODE
const getByKode = async (req, res) => {
    const kode_sparepart = req.params.kode_sparepart
    try {
        const sparepart = await Sparepart.findByPk(kode_sparepart)
        if(!sparepart) {
            return res.status(404).json({
                status: "error",
                code: 404,
                message: "data tidak ditemukan"
            });
        }
        res.status(200).json({
			status: "success",
			code: 200,
			data: sparepart,
		});
    } catch (error) {
        res.status(500).json({
			status: "error",
			code: 500,
			message: error || "Internal server error",
		});
    }
}
// CREATE SPAREPART
const createSparepart = async (req, res) => {
    // PAYLOADS
    const { kode_sparepart, nama_sparepart, merk, tipe, satuan, harga_beli } = req.body
    // VALIDASI
    const errors = validationResult(req).array().map(er => { return er.msg || er.message });
    if(errors != "") {
        return res.status(400).json({
            status: "error",
            code: 400,
            message: errors
        });
    }
    const existKode = await Sparepart.findOne({ where: {
        kode_sparepart: kode_sparepart,
        status: "true"
    }})
    if(existKode) return res.status(400).json({
		status: "error",
		code: 400,
		message: "Kode sparepart sudah terdaftar"
	});
    // START TRANSACTION
    const transaction = await sequelize.transaction()
    try {
        const newSparepart = await Sparepart.create({
            kode_sparepart: kode_sparepart.toString(),
            nama_sparepart: nama_sparepart.toString(),
            merk: merk.toString(),
            tipe: tipe.toString(),
            satuan: satuan.toString(),
            harga_beli: Number(harga_beli),
            created_by: req.session.user,
            created_date: new Date().toISOString(),
            deleted_by: "",
            deleted_date: new Date(1).toISOString(),
            status: "true"
        },
        { transaction: transaction })
        // CREATE LOG USER
		const log_user = await logUser.createLog(
			"Menambah data sparepart",
			kode_sparepart,
			req.session.user,
			transaction
		);
        if (log_user.error) throw log_user.error;
        // COMMIT
        await transaction.commit()
        // RESPOSNSE
        res.status(201).json({
			status: "success",
			code: 201,
			message: "Berhasil menambahkan data",
			data: newSparepart,
		});
    } catch (error) {
        await transaction.rollback()
        res.status(500).json({
			status: "error",
			code: 500,
			message: error || "gagal menambahkan data",
		});
    }
}
// EDIT SPAREPART
const editSparepart = async (req, res) => {
    // PAYLOADS
    const kode = req.params.kode
    const { nama_sparepart, merk, tipe, satuan, harga_beli } = req.body
    // VALIDASI
    const errors = validationResult(req).array().map(er => { return er.msg || er.message });
    if(errors != "") return res.status(400).json({
		status: "error",
		code: 400,
		message: errors
	});
    const sparepart = await Sparepart.findOne({
        where: {
            kode_sparepart: kode,
            status: "true"
        }
    })
    if(!sparepart) return res.status(404).json({
		status: "error",
		code: 404,
		message: "Kode sparepart tidak ditemukan"
	});
    // START TRANSACTION
    const transaction = await sequelize.transaction()
    try {
        const updt = await sparepart.update({
            nama_sparepart: nama_sparepart.toString(),
            merk: merk.toString(),
            tipe: tipe.toString(),
            satuan: satuan.toString(),
            harga_beli: Number(harga_beli),
        }, { transaction: transaction });
        updt.save()
        // CREATE LOG USER
		const log_user = await logUser.createLog(
			"Mengubah data sparepart",
			updt.kode_sparepart,
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
			data: updt,
		});
    } catch (error) {
        await transaction.rollback()
        res.status(500).json({
			status: "error",
			code: 500,
			message: error || "Internal Server Error",
		});
    }
}
// DELETE SPAREPART
const deleteSparepart = async (req, res) => {
    // GET PARAMS
    const kode = req.params.kode
    const sparepart = await Sparepart.findOne({
        where: {
            kode_sparepart: kode,
            status: "true"
        }
    })
    if(!sparepart) return res.status(404).json({
        status: "error",
        code: 404,
        message: "Kode sparepart tidak ditemukan"
    });
    // START TRANSACTION
    const transaction = await sequelize.transaction()
    try {
        const updt = await sparepart.update({
            deleted_by: req.session.user,
            deleted_date: new Date().toISOString(),
            status: "false"
        },
        { transaction: transaction });
        // CREATE LOG
		const log_user = await logUser.createLog(
			"Menghapus data sparepart",
			updt.kode_sparepart,
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
			message: "Data berhasil dihapus",
			data: updt,
		});
    } catch (error) {
        await transaction.rollback()
        res.status(500).json({
			status: "error",
			code: 500,
			message: error || "gagal menambahkan data",
		});
    }
}

module.exports = {
    getAll,
    getByKode,
    createSparepart,
    editSparepart,
    deleteSparepart
}