const { Op, where } = require("sequelize");
const bcrypt = require('bcrypt')
const { validationResult } = require("express-validator");
const jwt = require('jsonwebtoken')
// const utils = require("../utils/utils")
const utils = require('./utils')
const sequelize = require('../../connect')
const logUser = require("../controllers/logUserController");
const RoleModel = require("../models/RoleModel");
const LogUser = require("../models/logUser");
const PermissionModel = require("../models/permissionModel");

// BASE CONFIGURATION
let config = {
	model: PermissionModel,
	PK: "id_permission",
	hideFields: ["id_permission"],
	modelAssociation: [
		{
			toModel: RoleModel,
			relation: "hasMany",
			model: PermissionModel,
			fk: "role_id"
		},
		{
			toModel: PermissionModel,
			relation: "belongsTo",
			model: RoleModel,
			fk: "role_id",
		},
	],
	include: [
		{ 
			model: RoleModel,
            strModel: "RoleModel",
            attributes: ['nama_role']
		}
	],
};

const wipeData = () => {
	config = {
		model: PermissionModel,
		PK: "id_permission",
		hideFields: ["id_permission"],
		modelAssociation: [
			{
				toModel: RoleModel,
				relation: "hasMany",
				model: PermissionModel,
				fk: "role_id"
			},
			{
				toModel: PermissionModel,
				relation: "belongsTo",
				model: RoleModel,
				fk: "role_id",
			},
		],
		include: [
			{ 
				model: RoleModel,
				strModel: "RoleModel",
				attributes: ['nama_role']
			}
		],
	}
}

// GET
const getAll = async (req, res) => {

	wipeData()

    let whereCondition = Object.fromEntries(
		Object.entries(req.query).filter(
			([key, value]) => key != "limit" && key != "page"
		)
	);
	config.limit = req.query.limit
	config.page = req.query.page
	config.whereCondition = whereCondition

	await utils.GetData(config, res)
}
// GET BY KODE
const getByKode = async (req, res) => {

	wipeData()

	config.byPK = req.params.id
	await utils.GetData(config, res)
};
// CREATE PERMISSION
const createPermission = async (req, res) => {

	wipeData()

    // GET PAYLOAD
    const { nama_role, method, table } = req.body;
    let role, check = [];

	let validate = await utils.Validate(req, res, check)
	if(validate) return validate

    if(nama_role) {
        role = await RoleModel.findOne({
            where: { nama_role: nama_role }
        })
        check = [
            {
                model: PermissionModel,
                whereCondition: { 
                    role_id: role.id_role,
                    method: method.toUpperCase(),
                    table: table,
                },
                title: "Permission",
                check: "isDuplicate",
            },
        ];
    }
    // VALIDATE
	validate = await utils.Validate(req, res, check)
	if(validate) return validate
    
    // START TRANSACTION
    const transaction = await sequelize.transaction();
    try {
        config.data = {
            role_id: role.id_role,
            method: method,
            table: table,
        }
        config.log = [
            {
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Menambahkan data role permission",
					keterangan: role.id_role,
					kode_user: req.session.user,
				}
			}
        ]
        const result = await utils.CreateData(req, config, transaction)
		if(result.error) throw result.error
        // COMMIT
        await transaction.commit();
        // RESPONSE
		res.status(201).json({
			status: "success",
			code: 201,
			message: ["Berhasil menambahkan data"],
            data: result
		});
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
			status: "error",
			code: 500,
			message: error ?? ["Internal Server Error"],
		});
    }
}
// EDIT PERMISSION
const editPermission = async (req, res) => {

	wipeData()

    // PARAM & PAYLOAD
    const kode = req.params.id_permission;
	const { method, table } = req.body;
    // VALIDASI
    let check = [
		{
			model: PermissionModel,
			whereCondition: {id_permission: kode},
			title: "Role",
			check: "isAvailable",
		},
	];
    let validate = await utils.Validate(req, res, check)
	if(validate) return validate
    // START TRANSACTION
    const transaction = await sequelize.transaction();
	try {
        const role = await PermissionModel.findOne({ where: {
            id_permission: kode,
        }});
        config.data = {
            role_id: role.role_id,
            method: method ? method.toUpperCase() : role.method,
            table: table ? table.toString() : role.table,
        }
        config.log = [
            {
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Mengubah data permission",
					keterangan: kode,
					kode_user: req.session.user,
				}
			}
        ]
		await utils.UpdateData(req, config, transaction)
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
			message: error ?? ["Internal Server Error"],
		});
	}
}
// HAPUS PERMISSION
const deletePermission = async (req, res) => {

	wipeData()

    // PARAMS
	const kode = req.params.id_permission;
    // START TRANSACTION
    const transaction = await sequelize.transaction();
	try {
		config.data = {
            id_permission: kode
        }
		config.log = [
			{
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Menghapus data permission",
					keterangan: kode,
					kode_user: req.session.user,
				}
			}
		]
		let deleteLog = await utils.DeleteData(req, config, transaction)
		if(deleteLog.error) throw deleteLog.error
        // COMMIT
        await transaction.commit()
		// RESULT
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
			message: error ?? ["Internal Server Error"],
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