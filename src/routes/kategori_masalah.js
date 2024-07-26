
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const kategoriMasalahController = require('../controllers/kategoriMasalahController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
	],
	kategoriMasalahController.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
	],
	kategoriMasalahController.getSearch
);
router.get(
	"/:kode",
	[
		authenticate.authenticateToken,
	],
	kategoriMasalahController.getByKode
);
router.post(
	"/",
	[
		authenticate.authenticateToken,
		// validasi
		body("nama_kategori").notEmpty().withMessage("Nama kategori tidak boleh kosong"),
	],
	kategoriMasalahController.createKategori
);
// edit
router.put(
	"/:kode",
	[
		authenticate.authenticateToken,
	],
	kategoriMasalahController.editKategori
);
// delete
router.delete(
	"/:kode",
	[
		authenticate.authenticateToken,
	],
	kategoriMasalahController.deleteKategori
);

module.exports = router;