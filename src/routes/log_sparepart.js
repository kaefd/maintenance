
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const logSparepartController = require('../controllers/logSparepartController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'log_sparepart'),
	],
	logSparepartController.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'log_sparepart'),
	],
	logSparepartController.getSearch
);


module.exports = router;