
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const penangananController = require('../controllers/penangananController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
	],
	penangananController.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
	],
	penangananController.getSearch
);
// get by pk
router.get(
	"/:no_penanganan",
	[
		authenticate.authenticateToken,
	],
	penangananController.getByKode
);
// create penanganan
router.post(
	"/:no_masalah",
	[
		authenticate.authenticateToken,
		body("nama_penanganan").notEmpty().withMessage("Penanganan tidak bolek kosong"),
	],
	penangananController.createPenanganan
);
// delete penanganan
router.delete(
	"/:no_penanganan",
	[
		authenticate.authenticateToken,
	],
	penangananController.deletePenanganan
);


module.exports = router;