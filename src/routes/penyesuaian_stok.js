const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const penyesuaianController = require('../controllers/penyesuaianController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
	],
	penyesuaianController.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
	],
	penyesuaianController.getSearch
);
// get by pk
router.get(
	"/:no_penyesuaian",
	[
		authenticate.authenticateToken,
	],
	penyesuaianController.getByKode
);
// create
router.post(
	"",
	[
		authenticate.authenticateToken,
		// validasi
		body("kode_sparepart").notEmpty().withMessage("Sparepart tidak boleh kosong"),
		body("kategori").notEmpty().withMessage("Kategori tidak boleh kosong"),
		body("jumlah")
			.notEmpty()
			.withMessage("Jumlah tidak boleh kosong")
			.isNumeric()
			.withMessage("Jumlah harus berupa angka"),
	],
	penyesuaianController.createPenyesuaian
);
// batal
router.delete(
	"/:kode",
	[
		authenticate.authenticateToken,
	],
	penyesuaianController.deletePenyesuaian
);


module.exports = router;