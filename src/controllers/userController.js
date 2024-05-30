const { Op } = require("sequelize");
const bcrypt = require('bcrypt')
const { validationResult } = require("express-validator");
const jwt = require('jsonwebtoken')
const utils = require("../utils/utils")
const sequelize = require('../../connect')
const logUser = require("../controllers/logUserController");
const UserModel = require("../models/userModel");
const RoleModel = require("../models/RoleModel");
const config = require("../middleware/config");
const LogUser = require("../models/logUser");

// REGISTER
const register = async (req, res) => {
    // PAYLOADS
    let { username, password } = req.body
    let errors = validationResult(req).array().map(er => { return er.msg || er.message })
	if (errors != "") return res.status(400).json({
		status: "error",
		code: 400,
		message: errors
	});
    const user = await UserModel.findOne({ where: { username: username }})
    if(user) return res.status(400).json({
        status: "error",
        code: 400,
        message: "Username sudah digunakan"
    });
    // START TRANSACTION
    const transaction = await sequelize.transaction()
    try {
        // HASH PASSWORD
        let hash = await utils.generateHash(password)
        const data = await UserModel.create({
            username: username.toString(),
            password: hash,
            role_id: 5,
            created_by: username.toString(),
            created_date: new Date().toISOString(),
            deleted_by: "",
            deleted_date: new Date(1).toISOString(),
            status: "true"
        },
        { transaction: transaction })
        // CREATE LOG USER
		const log_user = await logUser.createLog(
			"Melakukan registrasi",
			username.toString(),
			username.toString(),
			transaction
		);
		if (log_user.error) throw log_user.error;
        // COMMIT
        await transaction.commit()
        // RESPONSE
		res.status(201).json({
			status: "success",
			code: 201,
			message: "Regristasi berhasil",
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
// LOGIN
const login = async (req, res) => {
    // PAYLOADS
    let { username, password } = req.body
    // VALIDASI
    let errors = validationResult(req).array().map(er => { return er.msg || er.message })
    if(errors != "") return res.status(400).json({
        status: "error",
        code: 400,
        message: errors
    });
    const user = await UserModel.findOne({ where: {
        username: username,
        status: "true"
    }})
    if(!user) return res.status(400).json({
        status: "error",
        code: 400,
        message: ['username atau password masih salah']
    })
    try {
        const isAuth = await bcrypt.compare(password, user.password)
        if(isAuth == false) throw ['username atau password masih salah']

        const payload = {
            username: username,
        }
        const token = jwt.sign(payload, config.secret, { expiresIn: 21600 });
        // RESPONSE
        res.status(200).json({ token: token })
    } catch (error) {
        res.status(500).json({
			status: "error",
			code: 500,
			message: error || "Internal Server Error",
		});
    }
}
// GET ALL USER
const getAll = async (req, res) => {
    // MODEL ASSOSIATION
    RoleModel.hasMany(UserModel, {foreignKey: 'role_id'})
    UserModel.belongsTo(RoleModel, {foreignKey: 'role_id'})
    const { limit = 10, page = 1 } = req.query;
	const offset = (page - 1) * limit;
    try {
		let user = await UserModel.findAll({
            where: {
                status: "true",
            },
            limit: parseInt(limit),
			offset: parseInt(offset),
            include: [{
                model: RoleModel,
                required: true,
                attributes: ['nama_role']
            }]
        })
        // CHECK USER VALUE
		if (!user) return res.status(400).json({
            status: "error",
            code: 400,
            message: ['user tidak ditemukan']
        })
        let total = await UserModel.findAll({
            where: {
                status: "true",
            },
        })
        // buat objek baru
        const users = user.map(u => { return {
            username: u.username,
            role_id: u.role_id,
            nama_role: u.RoleModel.nama_role,
            created_by: u.created_by,
            created_date: u.created_date,
            deleted_by: u.deleted_by,
            deleted_date: u.deleted_date,
            status: u.status
        }})
        var re = page > 1 ? total.length - (page * limit - limit) -  users.length : total.length - users.length
		res.status(200).json({
            status: "success",
			code: 200,
			page: parseInt(page),
			limit: parseInt(limit),
			rows: users.length,
			totalData: total.length,
			remainder: re || 0,
			data: users,
        })
	} catch (error) {
		res.status(500).json({
            status: "error",
            code: 500,
            message: ["Internal Server Error"]
        });
	} 
}
const getSearch = async (req, res) => {
	const input = req.query.search
    RoleModel.hasMany(UserModel, {foreignKey: 'role_id'})
    UserModel.belongsTo(RoleModel, {foreignKey: 'role_id'})
    try {
		let user = await UserModel.findAll({
            where: {
                status: "true",
            },
            include: [{
                model: RoleModel,
                required: true,
                attributes: ['nama_role']
            }]
        })
        // CHECK USER VALUE
		if (!user) return res.status(400).json({
            status: "error",
            code: 400,
            message: ['user tidak ditemukan']
        })
        // buat objek baru
        const users = user.map(u => { return {
            username: u.username,
            role_id: u.role_id,
            nama_role: u.RoleModel.nama_role,
            created_by: u.created_by,
            created_date: u.created_date,
            deleted_by: u.deleted_by,
            deleted_date: u.deleted_date,
            status: u.status
        }})
		const search = input ? users.filter(item => Object.values(item).some(value => typeof value == 'string' && value.toLowerCase().includes(input.toLowerCase()))) : users
		// RESPONSE
		res.status(200).json({
			status: "success",
			code: 200,
			page: 1,
			limit: parseInt(search.length),
			rows: search.length,
			totalData: search.length,
			remainder: 0,
			data: search,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: error|| ["Internal server error"],
		});
	}
}
// GET USER BY KODE
const getByKode = async (req, res) => {
    // MODEL ASSOSIATION
    RoleModel.hasMany(UserModel, {foreignKey: 'role_id'})
    UserModel.belongsTo(RoleModel, {foreignKey: 'role_id'})
    // PARAMS
    const username = req.params.username;
	try {
		const user = await UserModel.findAll({
            where: {
                status: "true",
                username: username
            },
            include: [{
                model: RoleModel,
                required: true,
                attributes: ['nama_role']
            }]
        })
        // check data value
		if (!user) return res.status(400).json({
            status: "error",
            code: 400,
            message: 'username tidak ditemukan'
        })
        // buat objek baru
        const users = user.map(u => { return {
            username: u.username,
            nama_role: u.RoleModel.nama_role,
            created_by: u.created_by,
            created_date: u.created_date,
            deleted_by: u.deleted_by,
            deleted_date: u.deleted_date,
            status: u.status
        }})
		res.status(200).json({
            status: "success",
            code: 200,
            data: users
        })
    } catch (error) {
		res.status(500).json({
            status: "error",
            code: 500,
            message: "Internal Server Error"
        });
	}
}
// CREATE USER
const createUser = async (req, res) => {
    // GET PAYLOAD
    const { username, password, nama_role } = req.body;
    // VALIDASI
    let errors = validationResult(req).array().map(er => { return er.msg || er.message })
	if (errors != "") return res.status(400).json({
		status: "error",
		code: 400,
		message: errors
	});
    const existKode = await UserModel.findOne({ where: { username: username } });
    if (existKode) return res.status(400).json({
		status: "error",
		code: 400,
		message: "Username sudah digunakan"
	});
    const role = await RoleModel.findOne({ where: {nama_role: nama_role} })
    if(!role) throw ["Nama role tidak ditemukan"]
    // START TRANSACTION
    const transaction = await sequelize.transaction();
    try {
        // HASH PASSWORD
        const pass = await utils.generateHash(password)
        await UserModel.create(
            {
                username: username.toString(),
                password: pass,
                role_id: role.id_role,
                created_by: req.session.user,
                created_date: new Date().toISOString(),
                deleted_by: "",
                deleted_date: new Date(1).toISOString(),
                status: "true",
            },
            { transaction: transaction }
        );
        // CREATE LOG USER
        const log_user = await logUser.createLog(
			"Menambahkan data user",
			req.session.user,
			username.toString(),
			transaction
		);
		if (log_user.error) throw log_user.error;
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
// EDIT USER
const editUser = async (req, res) => {
    // PARAM & PAYLOAD
    const kode = req.params.username;
	const { password, nama_role } = req.body;
    // VALIDASI
	let errors = validationResult(req).array().map(er => { return er.msg || er.message })
	if (errors != "") return res.status(400).json({
		status: "error",
		code: 400,
		message: errors
	});
    const user = await UserModel.findOne({ where: {
        username: kode,
        status: "true"
    }});
    if (!user) return res.status(404).json({
		status: "error",
		code: 404,
		message: ["User tidak ditemukan"]
	});
    const role = nama_role ? await RoleModel.findOne({ where: {nama_role: nama_role} }) : user.role_id
    // START TRANSACTION
    const transaction = await sequelize.transaction();
	try {
        // generate password
        if(password) {
            const pass = await utils.generateHash(password)
            const updt = await user.update({
                password: pass,
                role_id: role.id_role || role,
            },
            { transaction: transaction })
            updt.save()
        } else {
            const updt = await user.update({
                role_id: role.id_role || role,
            },
            { transaction: transaction })
            updt.save()
        }
        // CREATE LOG USER
        const log_user = await logUser.createLog(
			"Mengubah data user",
			req.session.user,
			kode,
			transaction
		);
		if (log_user.error) throw log_user.error;
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
// HAPUS USER
const deleteUser = async (req, res) => {
    // PARAMS
	const kode = req.params.username;
    // START TRANSACTION
    const transaction = await sequelize.transaction();
	try {
		const user = await UserModel.findByPk(kode);
		if (!user) return res.status(404).json({
            status: "error",
            code: 404,
            message: ["User tidak ditemukan"]
        });
		const updt = await user.update({
            deleted_by: req.session.user,
            deleted_date: new Date().toISOString(),
            status: "false",
        },
        { transaction: transaction })
        updt.save()
        // CREATE LOG USER
        const log_user = await logUser.createLog(
			"Menghapus data user",
			req.session.user,
			kode,
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
    register,
    login,
    getAll,
    getSearch,
    getByKode,
    createUser,
    editUser,
    deleteUser
}