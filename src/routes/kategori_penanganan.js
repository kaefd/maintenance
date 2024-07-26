
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const kategoriPenangananController = require('../controllers/kategoriPenangananController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
	],
	kategoriPenangananController.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
	],
	kategoriPenangananController.getSearch
);
router.get(
	"/:kode",
	[
		authenticate.authenticateToken,
	],
	kategoriPenangananController.getByKode
);
router.post(
	"/",
	[
		authenticate.authenticateToken,
		// validasi
		body("nama_penanganan").notEmpty().withMessage("Nama penanganan tidak boleh kosong"),
	],
	kategoriPenangananController.createKategori
);
// edit
router.put(
	"/:kode",
	[
		authenticate.authenticateToken,
	],
	kategoriPenangananController.editKategori
);
// delete
router.delete(
	"/:kode",
	[
		authenticate.authenticateToken,
	],
	kategoriPenangananController.deleteKategori
);

module.exports = router;