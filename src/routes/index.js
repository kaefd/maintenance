
const express = require('express');
const { body } = require("express-validator");

const userController = require("../controllers/userController");
const role = require('./role');
const mesin = require('./mesin');
const sparepart = require('./sparepart');
const user = require('./user');
const kategori_masalah = require('./kategori_masalah');
const kategori_penanganan = require('./kategori_penanganan');
const penyesuaian_stok = require('./penyesuaian_stok');
const masalah = require('./masalah')
const penanganan = require('./penanganan')
const penanganan_detail = require('./penanganan_detail')
const log_mesin = require('./log_mesin')
const log_sparepart = require('./log_sparepart')
const log_user = require('./log_user')

const router = express.Router();

/**
 * ENDPOINT
 * 
 * /login
 * /register
 * /role
 * /data_user
 * /data_mesin
 * /data_sparepart
 * /kategori_masalah
 * /kategori_penanganan
 * /penyesuaian_stok
 * /masalah
 * /penanganan
 * /penanganan_detail
 * /log_mesin
 * /log_sparepart
 * /log_user
 * 
 */

// REGISTER
router.post(
	"/register",
	[
		body("username").notEmpty().withMessage("Username tidak boleh kosong"),
		body("password")
			.notEmpty()
			.withMessage("Password tidak boleh kosong")
			.isLength({ min: 8 })
			.withMessage("Password minimal 8 karakter"),
	],
	userController.register
);
// LOGIN
router.post(
	"/login",
	[
		body("username").notEmpty().withMessage("Username tidak boleh kosong"),
		body("password").notEmpty().withMessage("Password tidak boleh kosong"),
	],
	userController.login
);

router.use('/role', role);
router.use('/data_mesin', mesin);
router.use('/data_sparepart', sparepart);
router.use('/data_user', user);
router.use('/kategori_masalah', kategori_masalah);
router.use('/kategori_penanganan', kategori_penanganan);
router.use('/penyesuaian_stok', penyesuaian_stok);
router.use('/masalah', masalah);
router.use('/penanganan', penanganan);
router.use('/penanganan_detail', penanganan_detail);
router.use('/log_mesin', log_mesin)
router.use('/log_sparepart', log_sparepart)
router.use('/log_user', log_user)

module.exports = router;