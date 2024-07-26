
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const userController = require('../controllers/userController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
	],
	userController.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
	],
	userController.getSearch
);
router.get(
	"/:username",
	[
		authenticate.authenticateToken,
	],
	userController.getByKode
);
router.post(
	"/",
	[
		authenticate.authenticateToken,
		body("username").notEmpty().withMessage("Username tidak boleh kosong"),
		body("password")
			.notEmpty()
			.withMessage("Password tidak boleh kosong")
			.isLength({ min: 8 })
			.withMessage("Password minimal 8 karakter"),
	],
	userController.createUser
);
router.put(
	"/:username",
	[
		authenticate.authenticateToken,
	],
	userController.editUser
);
router.delete(
	"/:username",
	[
		authenticate.authenticateToken,
	],
	userController.deleteUser
);

module.exports = router;