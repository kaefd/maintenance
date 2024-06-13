
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const stokSparepart = require('../controllers/stokSparepart');
const authenticate = require("../middleware/middleware");

router.get(
	"/",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'stok_sparepart'),
	],
	stokSparepart.getAll
);
router.get(
	"/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'stok_sparepart'),
	],
	stokSparepart.getSearch
);


module.exports = router;