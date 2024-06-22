
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const detailMasalahController = require('../controllers/detailMasalahController');
const masalahController = require('../controllers/masalahController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_masalah'),
	],
	detailMasalahController.getAll
);
// get by pk
router.get(
	"/:no_masalah",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_masalah'),
	],
	detailMasalahController.getByKode
);
router.post(
	"/:no_masalah",
	[
		authenticate.authenticateToken,
		authenticate.authUser('CREATE', 'data_masalah'),
		body("penanganan").notEmpty().withMessage("Penanganan tidak bolek kosong"),
	],
	masalahController.createPenanganan
);
router.delete(
	"/:no_masalah",
	[
		authenticate.authenticateToken,
		authenticate.authUser('DELETE', 'data_masalah'),
	],
	masalahController.deletePenanganan
);


module.exports = router;