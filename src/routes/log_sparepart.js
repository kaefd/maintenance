
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const logSparepartController = require('../controllers/logSparepartController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
	],
	logSparepartController.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
	],
	logSparepartController.getSearch
);


module.exports = router;