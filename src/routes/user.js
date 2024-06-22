
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const userController = require('../controllers/userController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
		// authenticate.authUser('READ', 'data_user'),
	],
	userController.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_user'),
	],
	userController.getSearch
);
router.get(
	"/:username",
	[
		authenticate.authenticateToken,
		// authenticate.authUser('READ', 'data_user'),
	],
	userController.getByKode
);
router.post(
	"/",
	[
		authenticate.authenticateToken,
		authenticate.authUser('CREATE', 'data_user'),
		body("username").notEmpty().withMessage("Username tidak boleh kosong"),
		body("password")
			.notEmpty()
			.withMessage("Password tidak boleh kosong")
			.isLength({ min: 8 })
			.withMessage("Password minimal 8 karakter"),
		body("nama_role").notEmpty().withMessage("Role user tidak boleh kosong"),
	],
	userController.createUser
);
router.put(
	"/:username",
	[
		authenticate.authenticateToken,
		authenticate.authUser('EDIT', 'data_user'),
	],
	userController.editUser
);
router.delete(
	"/:username",
	[
		authenticate.authenticateToken,
		authenticate.authUser('DELETE', 'data_user'),
	],
	userController.deleteUser
);

module.exports = router;