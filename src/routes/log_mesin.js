
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const logMesinController = require('../controllers/logMesinController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
	],
	logMesinController.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
	],
	logMesinController.getSearch
);


module.exports = router;