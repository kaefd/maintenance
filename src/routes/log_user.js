
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const logUserController = require('../controllers/logUserController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'log_user'),
	],
	logUserController.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'log_user'),
	],
	logUserController.getSearch
);


module.exports = router;