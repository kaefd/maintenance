const { Op } = require("sequelize");
const bcrypt = require('bcrypt')
const { validationResult } = require("express-validator");
const jwt = require('jsonwebtoken')
const fun = require("../utils/utils")
const sequelize = require('../../connect')
const logUser = require("../controllers/logUserController");
const UserModel = require("../models/userModel");
const RoleModel = require("../models/RoleModel");
const configs = require("../middleware/config");
const utils = require("./utils")
const LogUser = require("../models/logUser");

// BASE CONFIGURATION
let config = {
	model: UserModel,
	PK: "username",
    hideFields: ["password", "role_id"],
	whereCondition: { status: "true" },
    modelAssociation: [
        {
            toModel: RoleModel,
            relation: "hasMany",
            model: UserModel,
            fk: "role_id"
        },
        {
            toModel: UserModel,
            relation: "belongsTo",
            model: RoleModel,
            fk: "role_id",
        },
    ],
    include: [
        { 
            model: RoleModel,
            strModel: "RoleModel",
            attributes: ["nama_role"]
        }
    ],
};
const wipeData = () => {
    config = {
        model: UserModel,
        PK: "username",
        hideFields: ["password", "role_id"],
        whereCondition: { status: "true" },
        modelAssociation: [
            {
                toModel: RoleModel,
                relation: "hasMany",
                model: UserModel,
                fk: "role_id"
            },
            {
                toModel: UserModel,
                relation: "belongsTo",
                model: RoleModel,
                fk: "role_id",
            },
        ],
        include: [
            { 
                model: RoleModel,
                strModel: "RoleModel",
                attributes: ["nama_role"]
            }
        ],
    }
}
// REGISTER
const register = async (req, res) => {

    wipeData()

    // PAYLOADS
    let { username, password } = req.body
    // VALIDASI
	let validate = await utils.Validate(req, res, [])
	if(validate) return validate

	let check = [
		{
			model: UserModel,
			whereCondition: { 
				username: username,
			},
			title: "Username",
			check: "isDuplicate",
		},
	];
	validate = await utils.Validate(req, res, check)
	if(validate) return validate
    // START TRANSACTION
    const transaction = await sequelize.transaction()
    try {
        // HASH PASSWORD
        let hash = await fun.generateHash(password)
        config.data = {
            username: username.toString(),
            password: hash,
            role_id: 5,
            created_by: username.toString(),
            created_date: new Date(),
            deleted_by: "",
            deleted_date: "",
            status: "true"
        }
        config.log = [
            {
				model: LogUser,
				data: {
                    kode_user: username,
					tanggal: new Date(),
					kategori: "Melakukan registrasi",
					keterangan: username,
				}
			}
        ]
        // POST DATA
		const result = await utils.CreateData(req, config, transaction)
		if(result.error) throw result.error
        // COMMIT
        await transaction.commit()
        // RESPONSE
		res.status(201).json({
			status: "success",
			code: 201,
			message: ["Regristasi berhasil"],
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
// LOGIN
const login = async (req, res) => {

    wipeData()

    // PAYLOADS
    let { username, password } = req.body
    // VALIDASI
    let check = [
		{
			model: UserModel,
			whereCondition: { 
				username: username,
                status: "true"
			},
			title: "Username",
            message: "Username atau password masih salah",
			check: "isAvailable",
		},
	];
	let validate = await utils.Validate(req, res, check)
	if(validate) return validate
    try {
        let user = await UserModel.findByPk(username)
        const isAuth = await bcrypt.compare(password, user.dataValues.password)
        if(isAuth == false) throw ['username atau password masih salah']

        const payload = {
            username: username,
        }
        const token = jwt.sign(payload, configs.secret, { expiresIn: 21600 });
        // RESPONSE
        res.status(200).json({ token: token })
    } catch (error) {
        res.status(500).json({
			status: "error",
			code: 500,
			message: error ?? ["Internal Server Error"],
		});
    }
}
// GET ALL USER
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
// GET USER BY KODE
const getByKode = async (req, res) => {

    wipeData()

	config.byPK = req.params.username
	await utils.GetData(config, res)
}
// CREATE USER
const createUser = async (req, res) => {

    wipeData()

    // GET PAYLOAD
    const { username, password, nama_role } = req.body;
    // VALIDATE
    let validate = await utils.Validate(req, res, [])
	if(validate) return validate
	let check = [
		{
			model: UserModel,
			whereCondition: {username: username},
			title: "Username",
			check: "isDuplicate",
		},
        {
			model: RoleModel,
			whereCondition: {nama_role: nama_role},
			title: "Role",
			check: "isAvailable",
		}
	];
	validate = await utils.Validate(req, res, check)
	if(validate) return validate
    // START TRANSACTION
    const transaction = await sequelize.transaction();
    try {
        let role = await RoleModel.findOne({ where: { nama_role: nama_role } })
        // HASH PASSWORD
        const pass = await fun.generateHash(password)
        config.data = {
            username: username.toString(),
            password: pass,
            role_id: role.id_role ?? 5,
            created_by: req.session.user,
            created_date: new Date().toISOString(),
            deleted_by: "",
            deleted_date: new Date(1).toISOString(),
            status: "true",
        }
        config.log = [
            {
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Menambah data user",
					keterangan: username,
					kode_user: req.session.user,
				}
			}
        ]
        // POST DATA
		const result = await utils.CreateData(req, config, transaction)
		if(result.error) throw result.error
        // COMMIT
        await transaction.commit();
        // RESPONSE
		res.status(201).json({
			status: "success",
			code: 201,
			message: ["Berhasil menambahkan data"],
		})
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
			status: "error",
			code: 500,
			message: error ?? ["Internal Server Error"],
		});
    }
}
// EDIT USER
const editUser = async (req, res) => {

    wipeData()
    
    // PARAM & PAYLOAD
    const kode = req.params.username;
	const { password, nama_role } = req.body;
    // VALIDASI
	let check = [
		{
			model: UserModel,
			whereCondition: {username: kode, status: "true"},
			title: "Username",
			check: "isAvailable",
		},
	];
    let validate = await utils.Validate(req, res, check)
	if(validate) return validate

    // START TRANSACTION
    const transaction = await sequelize.transaction();
	try {
        const user = await UserModel.findByPk(kode)
        const role = nama_role ? await RoleModel.findOne({ where: {nama_role: nama_role} }) : user.role_id
        const newpass = password ? await fun.generateHash(password) : user.password

        config.data = {
            username: kode,
            password: newpass,
            role_id: role.id_role ?? role
        }
        config.log = [
            {
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Mengubah data user",
					keterangan: kode,
					kode_user: req.session.user,
				}
			}
        ]
        // POST DATA
		const result = await utils.UpdateData(req, config, transaction)
		if(result.error) throw result.error
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
// HAPUS USER
const deleteUser = async (req, res) => {

    wipeData()
    
    // PARAMS
	const kode = req.params.username;
    // START TRANSACTION
    const transaction = await sequelize.transaction();
	try {
		const user = await UserModel.findByPk(kode);
		
        config.data = {
            username: kode,
            deleted_by: req.session.user,
            deleted_date: new Date().toISOString(),
            status: "false",
        }
		config.log = [
            {
				model: LogUser,
				data: {
					tanggal: new Date(),
					kategori: "Menghapus data user",
					keterangan: kode,
					kode_user: req.session.user,
				}
			}
        ]
        let deleteLog = await utils.UpdateData(req, config, transaction)
		if(deleteLog.error) throw deleteLog.error
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
			message: error ?? ["Internal Server Error"],
		});
	}
}
// export

module.exports = {
    register,
    login,
    getAll,
    getSearch,
    getByKode,
    createUser,
    editUser,
    deleteUser
}