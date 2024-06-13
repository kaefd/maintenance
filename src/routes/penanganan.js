
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const masalahController = require('../controllers/masalahController');
const authenticate = require("../middleware/middleware");

router.post(
	"/:no_masalah",
	[
		authenticate.authenticateToken,
		authenticate.authUser('CREATE', 'masalah_detail'),
		body("penanganan").notEmpty().withMessage("Penanganan tidak bolek kosong"),
	],
	masalahController.createPenanganan
);
router.delete(
	"/:no_masalah",
	[
		authenticate.authenticateToken,
		authenticate.authUser('DELETE', 'masalah_detail'),
	],
	masalahController.deletePenanganan
);


module.exports = router;