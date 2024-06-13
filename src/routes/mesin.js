
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const mesinController = require('../controllers/mesinController');
const authenticate = require("../middleware/middleware");

router.route('/')
    .get([
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_mesin'),
	],
	mesinController.getAll);

router.route('/search')
    .get([
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_mesin'),
	],
	mesinController.getSearch);

router.route('/:kode_mesin')
    .get([
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_mesin'),
	],
	mesinController.getByKode);

router.route('/').post([
		authenticate.authenticateToken,
		authenticate.authUser('CREATE', 'data_mesin'),
		// validasi
		body("kode_mesin")
			.notEmpty()
			.withMessage("Kode Mesin tidak boleh kosong")
			.isLength({ min: 2 })
			.withMessage("Kode minimal 2 karakter"),
		body("nama_mesin").notEmpty().withMessage("Nama mesin tidak boleh kosong"),
	],
	mesinController.createMesin
)
router.put(
	"/:kode",
	[
		authenticate.authenticateToken,
		authenticate.authUser('EDIT', 'data_mesin'),
	],
	mesinController.editMesin
);
router.delete(
	"/:kode",
	[
		authenticate.authenticateToken,
		authenticate.authUser('DELETE', 'data_user'),
	],
	mesinController.deleteMesin
);


module.exports = router;