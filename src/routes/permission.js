
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const permissionController = require('../controllers/permissionController');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'role_permissions'),
	],
	permissionController.getAll
);
// GET BY PK
router.get(
	"/:id",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'role_permissions'),
	],
	permissionController.getByKode
);
// PUT
router.put(
	"/:id_permission",
	[
		authenticate.authenticateToken,
		authenticate.authUser('EDIT', 'role_permissions'),
	],
	permissionController.editPermission
);
// POST
router.post(
	"/",
	[
		authenticate.authenticateToken,
		authenticate.authUser('CREATE', 'role_permissions'),
		body("nama_role").notEmpty().withMessage("role tidak boleh kosong"),
		body("method").notEmpty().withMessage("otoritas tidak boleh kosong"),
		body("table").notEmpty().withMessage("tabel tidak boleh kosong"),
	],
	permissionController.createPermission
);
// DELETE
router.delete(
	"/:id_permission",
	[
		authenticate.authenticateToken,
		authenticate.authUser('DELETE', 'role_permissions'),
	],
	permissionController.deletePermission
);



module.exports = router;