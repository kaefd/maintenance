
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const penangananDetail = require('../controllers/penangananDetail');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
	],
	penangananDetail.getAll
);
// get by pk
router.get(
	"/:no_penanganan",
	[
		authenticate.authenticateToken,
	],
	penangananDetail.getByKode
);
// create penanganan
router.post(
	"/:no_masalah",
	[
		authenticate.authenticateToken,
		body("nama_penanganan").notEmpty().withMessage("Penanganan tidak bolek kosong"),
	],
	penangananDetail.createPenangananDetail
);
// delete penanganan
router.delete(
	"/:no_penanganan",
	[
		authenticate.authenticateToken,
	],
	penangananDetail.deletePenangananDetail
);


module.exports = router;