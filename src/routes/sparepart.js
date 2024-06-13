
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const sparepartController = require('../controllers/sparepartController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_sparepart'),
	],
	sparepartController.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_sparepart'),
	],
	sparepartController.getSearch
);
// get by pk
router.get(
	"/:kode_sparepart",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_sparepart'),
	],
	sparepartController.getByKode
);
// create
router.post(
	"",
	[
		authenticate.authenticateToken,
		authenticate.authUser('CREATE', 'data_sparepart'),
		// validasi
		body("kode_sparepart")
			.notEmpty()
			.withMessage("Kode Sparepart tidak boleh kosong")
			.isLength({ min: 2 })
			.withMessage("Kode minimal 2 karakter"),
		body("nama_sparepart")
			.notEmpty()
			.withMessage("Nama sparepart tidak boleh kosong"),
	],
	sparepartController.createSparepart
);
// edit
router.put(
	"/:kode",
	[
		authenticate.authenticateToken,
		authenticate.authUser('EDIT', 'data_sparepart'),
	],
	sparepartController.editSparepart
);
// delete
router.delete(
	"/:kode",
	[
		authenticate.authenticateToken,
		authenticate.authUser('DELETE', 'data_sparepart'),
	],
	sparepartController.deleteSparepart
);


module.exports = router;