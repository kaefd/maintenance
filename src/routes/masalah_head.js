const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const masalahController = require('../controllers/masalahController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_masalah'),
	],
	masalahController.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_masalah'),
	],
	masalahController.getSearch
);
// get by pk
router.get(
	"/:no_masalah",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_masalah'),
	],
	masalahController.getByKode
);
// create masalah
router.post(
	"/",
	[
		authenticate.authenticateToken,
		authenticate.authUser('CREATE', 'data_masalah'),
		body("nama_kategori").notEmpty().withMessage("Kategori tidak boleh kosong"),
		body("kode_mesin").notEmpty().withMessage("Kode mesin tidak boleh kosong"),
	],
	masalahController.createMasalah
);
router.delete(
	"/:no_masalah",
	[
		authenticate.authenticateToken,
		authenticate.authUser('DELETE', 'data_masalah'),
	],
	masalahController.deleteMasalah
);

module.exports = router;