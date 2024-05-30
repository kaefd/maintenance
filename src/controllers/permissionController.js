const { Op, where } = require("sequelize");
const bcrypt = require('bcrypt')
const { validationResult } = require("express-validator");
const jwt = require('jsonwebtoken')
const utils = require("../utils/utils")
const sequelize = require('../../connect')
const logUser = require("../controllers/logUserController");
const RoleModel = require("../models/RoleModel");
const config = require("../middleware/config");
const LogUser = require("../models/logUser");
const PermissionModel = require("../models/permissionModel");

// GET
const getAll = async (req, res) => {
    // MODEL ASSOSIATION
    RoleModel.hasMany(PermissionModel, {foreignKey: 'role_id'})
    PermissionModel.belongsTo(RoleModel, {foreignKey: 'role_id'})
    const { limit = 10, page = 1 } = req.query;
	const offset = (page - 1) * limit;
    try {
        let whereCondition = {}
        
        if(req.query.role_id) whereCondition.role_id = req.query.role_id
        if(req.query.method) whereCondition.method = req.query.method
        if(req.query.table) whereCondition.table = req.query.table

		let role = await PermissionModel.findAll({
            limit: parseInt(limit),
			offset: parseInt(offset),
            where: whereCondition,
            include: [{
                model: RoleModel,
                required: true,
                attributes: ['nama_role']
            }]
        })
        const total = await PermissionModel.findAll({
			where: whereCondition
		})
        // CHECK ROLE VALUE
		if (!role) return res.status(400).json({
            status: "error",
            code: 400,
            message: ['role tidak ditemukan']
        })
        // buat objek baru
        const roles = role.map(u => { return {
            id_permission: u.id_permission,
            role_id: u.role_id,
            nama_role: u.RoleModel.nama_role,
            method: u.method,
            table: u.table,
        }})
		var re = page > 1 ? total.length - (page * limit - limit) -  roles.length : total.length - roles.length
		// RESPONSE
		res.status(200).json({
			status: "success",
			code: 200,
			page: parseInt(page),
			limit: parseInt(limit),
			rows: roles.length,
			totalData: total.length,
			remainder: re || 0,
			data: roles,
		});
	} catch (error) {
		res.status(500).json({
            status: "error",
            code: 500,
            message: ["Internal Server Error"]
        });
	} 
}
// GET BY KODE
const getByKode = async (req, res) => {
	const id = req.params.id;
	try {
		const role = await PermissionModel.findAll({
            where: {
                role_id: id
            }
        });
		if (!role) return res.status(404).json({
			status: "error",
			code: 404,
			message: ["data tidak ditemukan"]
		});
		res.status(200).json({
			status: "success",
			code: 200,
			data: role,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: error || ["Internal server error"],
		});
	}
};
// CREATE PERMISSION
const createPermission = async (req, res) => {
    // GET PAYLOAD
    const { nama_role, method, table } = req.body;
    // VALIDASI
    let errors = validationResult(req).array().map(er => { return er.msg || er.message })
	if (errors != "") return res.status(400).json({
		status: "error",
		code: 400,
		message: errors
	});
    const role = await RoleModel.findOne({
        where: { nama_role: nama_role }
    })
    if(!role) throw ["role tidak ditemukan"]

    const exist = await PermissionModel.findOne({ 
        where: { 
            role_id: role.id_role,
            method: method.toUpperCase(),
            table: table,
        }
    });
    if (exist) return res.status(400).json({
		status: "error",
		code: 400,
		message: ["Data sudah ada"]
	});
    // START TRANSACTION
    const transaction = await sequelize.transaction();
    try {
        // HASH PASSWORD
        const post = await PermissionModel.create(
            {
                role_id: role.id_role,
                method: method,
                table: table,
            },
            { transaction: transaction }
        );
        // CREATE LOG USER
        const log_user = await logUser.createLog(
			"Menambahkan data role permission",
			post.id_permission,
			req.session.user,
			transaction
		);
		if (log_user.error) throw [log_user.error];
        // COMMIT
        await transaction.commit();
        // RESPONSE
		res.status(201).json({
			status: "success",
			code: 201,
			message: ["Berhasil menambahkan data"],
		});
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
			status: "error",
			code: 500,
			message: error || ["Internal Server Error"],
		});
    }
}
// EDIT PERMISSION
const editPermission = async (req, res) => {
    // PARAM & PAYLOAD
    const kode = req.params.id_permission;
	const { method, table } = req.body;
    // VALIDASI
	let errors = validationResult(req).array().map(er => { return er.msg || er.message })
	if (errors != "") return res.status(400).json({
		status: "error",
		code: 400,
		message: errors
	});
    const role = await PermissionModel.findOne({ where: {
        id_permission: kode,
    }});
    if (!role) return res.status(404).json({
		status: "error",
		code: 404,
		message: ["Role tidak ditemukan"]
	});
    // START TRANSACTION
    const transaction = await sequelize.transaction();
	try {
		const updt = await role.update({
            role_id: role.role_id,
            method: method ? method.toUpperCase() : role.method,
            table: table ? table.toString() : role.table,
        },
        { transaction: transaction })
        updt.save()
        // CREATE LOG USER
        const log_user = await logUser.createLog(
            "Mengubah data permission",
            kode,
            req.session.user,
            transaction,
        );
		if (log_user.error) throw [log_user.error];
        // COMMIT
        await transaction.commit();
        // RESPONSE
        res.status(201).json({
			status: "success",
			code: 201,
			message: ["Berhasil mengubah data"],
		});
	} catch (error) {
        await transaction.rollback()
		res.status(500).json({
			status: "error",
			code: 500,
			message: error || ["Internal Server Error"],
		});
	}
}
// HAPUS PERMISSION
const deletePermission = async (req, res) => {
    // PARAMS
	const kode = req.params.id_permission;
    // START TRANSACTION
    const transaction = await sequelize.transaction();
	try {
		const role = await PermissionModel.findByPk(kode);
		if (!role) return res.status(404).json({
            status: "error",
            code: 404,
            message: ["Role tidak ditemukan"]
        });
		await role.destroy({ transaction: transaction })
        // CREATE LOG USER
        const log_user = await logUser.createLog(
			"Menghapus data permission",
			kode,
			req.session.user,
			transaction
		);
		if (log_user.error) throw [log_user.error];
        // COMMIT
        await transaction.commit()
        res.status(201).json({
			status: "success",
			code: 201,
			message: ["Berhasil menghapus data"],
		});
	} catch (error) {
        await transaction.rollback()
		res.status(500).json({
			status: "error",
			code: 500,
			message: error || ["Internal Server Error"],
		});
	}
}
// export

module.exports = {
    getAll,
    getByKode,
    createPermission,
    editPermission,
    deletePermission
}