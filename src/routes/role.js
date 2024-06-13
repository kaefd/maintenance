
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const roleController = require('../controllers/roleController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'role'),
	],
	roleController.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'role'),
	],
	roleController.getSearch
);
router.get(
	"/:id",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'role'),
	],
	roleController.getByKode
);
router.post(
	"/",
	[
		authenticate.authenticateToken,
		authenticate.authUser('CREATE', 'role'),
		body("nama_role").notEmpty().withMessage("Role tidak boleh kosong"),
	],
	roleController.createRole
);
router.put(
	"/:id",
	[
		authenticate.authenticateToken,
		authenticate.authUser('EDIT', 'role'),
		body("nama_role").notEmpty().withMessage("Role tidak boleh kosong"),
	],
	roleController.editRole
);
router.delete(
	"/:id",
	[
		authenticate.authenticateToken,
		authenticate.authUser('DELETE', 'role'),
	],
	roleController.deleteRole
);



module.exports = router;