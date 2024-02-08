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
        message: 'username atau password masih salah'
    })
    try {
        const isAuth = await bcrypt.compare(password, user.password)
            .then((res) => {
                return res
            })
            .catch(() => {
                return {
                    status: "error",
                    code: 400,
                    message: "Username atau password masih salah"
                }
            })

        if(isAuth != true) throw isAuth
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
            message: 'user tidak ditemukan'
        })
        // buat objek baru
        const users = user.map(u => { return {
            username: u.username,
            role: u.RoleModel.nama_role,
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
            role: u.RoleModel.nama_role,
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
    const { username, password, role_id } = req.body;
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
    // START TRANSACTION
    const transaction = await sequelize.transaction();
    try {
        // HASH PASSWORD
        const pass = await utils.generateHash(password)
        await UserModel.create(
            {
                username: username.toString(),
                password: pass,
                role_id: Number(role_id),
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
			message: "Berhasil menambahkan data",
		});
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
			status: "error",
			code: 500,
			message: error || "Internal Server Error",
		});
    }
}
// EDIT USER
const editUser = async (req, res) => {
    // PARAM & PAYLOAD
    const kode = req.params.username;
	const { password, role_id } = req.body;
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
		message: "User tidak ditemukan"
	});
    // START TRANSACTION
    const transaction = await sequelize.transaction();
	try {
        // generate password
        const pass = await utils.generateHash(password)
		const updt = await user.update({
            password: pass,
            role_id: Number(role_id),
        },
        { transaction: transaction })
        updt.save()
        // CREATE LOG USER
        const log_user = await logUser.createLog(
			"Mengubah data user",
			req.session.user,
			username,
			transaction
		);
		if (log_user.error) throw log_user.error;
        // COMMIT
        await transaction.commit();
        // RESPONSE
        res.status(201).json({
			status: "success",
			code: 201,
			message: "Berhasil mengubah data",
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
            message: "User tidak ditemukan"
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
			username,
			transaction
		);
		if (log_user.error) throw log_user.error;
        // COMMIT
        await transaction.commit()
        res.status(201).json({
			status: "success",
			code: 201,
			message: "Berhasil menghapus data",
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
// export

module.exports = {
    register,
    login,
    getAll,
    getByKode,
    createUser,
    editUser,
    deleteUser
}