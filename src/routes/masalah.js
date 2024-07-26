const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const masalahController = require('../controllers/masalahController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
	],
	masalahController.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
	],
	masalahController.getSearch
);
// get by pk
router.get(
	"/:no_masalah",
	[
		authenticate.authenticateToken,
	],
	masalahController.getByKode
);
// create masalah
router.post(
	"/",
	[
		authenticate.authenticateToken,
		body("nama_kategori").notEmpty().withMessage("Kategori tidak boleh kosong"),
		body("kode_mesin").notEmpty().withMessage("Kode mesin tidak boleh kosong"),
	],
	masalahController.createMasalah
);
// update status
router.put(
	"/:no_masalah",
	[
		authenticate.authenticateToken,
	],
	masalahController.verifikasiMasalah
);
// delete
router.delete(
	"/:no_masalah",
	[
		authenticate.authenticateToken,
	],
	masalahController.deleteMasalah
);

module.exports = router;