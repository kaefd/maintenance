
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const logMesinController = require('../controllers/logMesinController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'log_mesin'),
	],
	logMesinController.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'log_mesin'),
	],
	logMesinController.getSearch
);


module.exports = router;