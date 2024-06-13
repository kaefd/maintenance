const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const penyesuaianController = require('../controllers/penyesuaianController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'penyesuaian_stok_sparepart'),
	],
	penyesuaianController.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'penyesuaian_stok_sparepart'),
	],
	penyesuaianController.getSearch
);
// get by pk
router.get(
	"/:no_penyesuaian",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'penyesuaian_stok_sparepart'),
	],
	penyesuaianController.getByKode
);
// create
router.post(
	"",
	[
		authenticate.authenticateToken,
		authenticate.authUser('CREATE', 'penyesuaian_stok_sparepart'),
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
		authenticate.authUser('DELETE', 'penyesuaian_stok_sparepart'),
	],
	penyesuaianController.deletePenyesuaian
);


module.exports = router;