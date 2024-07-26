
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const roleController = require('../controllers/roleController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
	],
	roleController.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
	],
	roleController.getSearch
);
router.get(
	"/:id",
	[
		authenticate.authenticateToken,
	],
	roleController.getByKode
);
router.post(
	"/",
	[
		authenticate.authenticateToken,
		body("nama_role").notEmpty().withMessage("Role tidak boleh kosong"),
	],
	roleController.createRole
);
router.put(
	"/:id",
	[
		authenticate.authenticateToken,
		body("nama_role").notEmpty().withMessage("Role tidak boleh kosong"),
	],
	roleController.editRole
);
router.delete(
	"/:id",
	[
		authenticate.authenticateToken,
	],
	roleController.deleteRole
);



module.exports = router;