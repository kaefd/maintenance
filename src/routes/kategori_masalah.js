
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const kategoriMasalahController = require('../controllers/kategoriMasalahController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'kategori_masalah'),
	],
	kategoriMasalahController.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'kategori_masalah'),
	],
	kategoriMasalahController.getSearch
);
router.get(
	"/:kode",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'kategori_masalah'),
	],
	kategoriMasalahController.getByKode
);
router.post(
	"/",
	[
		authenticate.authenticateToken,
		authenticate.authUser('CREATE', 'kategori_masalah'),
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
		authenticate.authUser('EDIT', 'kategori_masalah'),
	],
	kategoriMasalahController.editKategori
);
// delete
router.delete(
	"/:kode",
	[
		authenticate.authenticateToken,
		authenticate.authUser('DELETE', 'kategori_masalah'),
	],
	kategoriMasalahController.deleteKategori
);

module.exports = router;