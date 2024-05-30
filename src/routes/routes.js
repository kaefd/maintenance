const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
// controller
const mesinController = require("../controllers/mesinController");
const sparepartController = require("../controllers/sparepartController");
const kategoriMasalahController = require("../controllers/kategoriMasalahController");
const penyesuaianController = require("../controllers/penyesuaianController");
const logUserController = require("../controllers/logUserController");
const userController = require("../controllers/userController");
const logSparepartController = require("../controllers/logSparepartController");
const logMesinController = require("../controllers/logMesinController");
const masalahController = require("../controllers/masalahController");
const detailMasalahController = require("../controllers/detailMasalahController");
const permissionController = require("../controllers/permissionController");
const roleController = require("../controllers/roleController");
const authenticate = require("../middleware/middleware");
const stokSparepart = require("../controllers/stokSparepart");

// REGISTER
router.post(
	"/register",
	[
		body("username").notEmpty().withMessage("Username tidak boleh kosong"),
		body("password")
			.notEmpty()
			.withMessage("Password tidak boleh kosong")
			.isLength({ min: 8 })
			.withMessage("Password minimal 8 karakter"),
	],
	userController.register
);
// LOGIN
router.post(
	"/login",
	[
		body("username").notEmpty().withMessage("Username tidak boleh kosong"),
		body("password").notEmpty().withMessage("Password tidak boleh kosong"),
	],
	userController.login
);

// ROLE
router.get(
	"/role",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'role'),
	],
	roleController.getAll
);
router.get(
	"/role/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'role'),
	],
	roleController.getSearch
);
router.get(
	"/role/:id",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'role'),
	],
	roleController.getByKode
);
router.post(
	"/role",
	[
		authenticate.authenticateToken,
		authenticate.authUser('CREATE', 'role'),
		body("nama_role").notEmpty().withMessage("Role tidak boleh kosong"),
	],
	roleController.createRole
);
router.put(
	"/role/:id",
	[
		authenticate.authenticateToken,
		authenticate.authUser('EDIT', 'role'),
		body("nama_role").notEmpty().withMessage("Role tidak boleh kosong"),
	],
	roleController.editRole
);
router.delete(
	"/role/:id",
	[
		authenticate.authenticateToken,
		authenticate.authUser('DELETE', 'role'),
	],
	roleController.deleteRole
);

// PERMISSIONS
// GET
router.get(
	"/permission",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'role_permissions'),
	],
	permissionController.getAll
);
// GET BY PK
router.get(
	"/permission/:id",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'role_permissions'),
	],
	permissionController.getByKode
);
// PUT
router.put(
	"/permission/:id_permission",
	[
		authenticate.authenticateToken,
		authenticate.authUser('EDIT', 'role_permissions'),
	],
	permissionController.editPermission
);
// POST
router.post(
	"/permission",
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
	"/permission/:id_permission",
	[
		authenticate.authenticateToken,
		authenticate.authUser('DELETE', 'role_permissions'),
	],
	permissionController.deletePermission
);

// DATA USER
router.get(
	"/data_user",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_user'),
	],
	userController.getAll
);
router.get(
	"/data_user/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_user'),
	],
	userController.getSearch
);
router.get(
	"/data_user/:username",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_user'),
	],
	userController.getByKode
);
router.post(
	"/data_user",
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
	"/data_user/:username",
	[
		authenticate.authenticateToken,
		authenticate.authUser('EDIT', 'data_user'),
	],
	userController.editUser
);
router.delete(
	"/data_user/:username",
	[
		authenticate.authenticateToken,
		authenticate.authUser('DELETE', 'data_user'),
	],
	userController.deleteUser
);

// MESIN
router.get(
	"/data_mesin",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_mesin'),
	],
	mesinController.getAll
);
router.get(
	"/data_mesin/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_mesin'),
	],
	mesinController.getSearch
);
router.get(
	"/data_mesin/:kode_mesin",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_mesin'),
	],
	mesinController.getByKode
);
router.post(
	"/data_mesin",
	[
		authenticate.authenticateToken,
		authenticate.authUser('CREATE', 'data_mesin'),
		// validasi
		body("kode_mesin")
			.notEmpty()
			.withMessage("Kode Mesin tidak boleh kosong")
			.isLength({ min: 2 })
			.withMessage("Kode minimal 2 karakter"),
		body("nama_mesin").notEmpty().withMessage("Nama mesin tidak boleh kosong"),
		body("tgl_beli")
			.notEmpty()
			.withMessage("Tgl beli tidak boleh kosong")
			.isDate()
			.withMessage("Format tanggal tidak sesuai"),
		body("supplier").notEmpty().withMessage("Supplier tidak boleh kosong"),
	],
	mesinController.createMesin
);
// edit
router.put(
	"/data_mesin/:kode",
	[
		authenticate.authenticateToken,
		authenticate.authUser('EDIT', 'data_mesin'),
	],
	mesinController.editMesin
);
// delete
router.delete(
	"/data_mesin/:kode",
	[
		authenticate.authenticateToken,
		authenticate.authUser('DELETE', 'data_user'),
	],
	mesinController.deleteMesin
);
// end

//SPAREPART
// get all
router.get(
	"/data_sparepart",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_sparepart'),
	],
	sparepartController.getAll
);
router.get(
	"/data_sparepart/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_sparepart'),
	],
	sparepartController.getSearch
);
// get by pk
router.get(
	"/data_sparepart/:kode_sparepart",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'data_sparepart'),
	],
	sparepartController.getByKode
);
// create
router.post(
	"/data_sparepart",
	[
		authenticate.authenticateToken,
		authenticate.authUser('CREATE', 'data_sparepart'),
		// validasi
		body("kode_sparepart")
			.notEmpty()
			.withMessage("Kode Sparepart tidak boleh kosong")
			.isLength({ min: 2 })
			.withMessage("Kode minimal 2 karakter"),
		body("nama_sparepart")
			.notEmpty()
			.withMessage("Nama sparepart tidak boleh kosong"),
		body("merk").notEmpty().withMessage("Merk tidak boleh kosong"),
		body("tipe").notEmpty().withMessage("Tipe tidak boleh kosong"),
		body("satuan").notEmpty().withMessage("Satuan tidak boleh kosong"),
		body("harga_beli")
			.notEmpty()
			.withMessage("Harga beli tidak boleh kosong")
			.isNumeric()
			.withMessage("Harga beli harus berupa angka"),
	],
	sparepartController.createSparepart
);
// edit
router.put(
	"/data_sparepart/:kode",
	[
		authenticate.authenticateToken,
		authenticate.authUser('EDIT', 'data_sparepart'),
	],
	sparepartController.editSparepart
);
// delete
router.delete(
	"/data_sparepart/:kode",
	[
		authenticate.authenticateToken,
		authenticate.authUser('DELETE', 'data_sparepart'),
	],
	sparepartController.deleteSparepart
);
//  end

// KATEGORI MASALAH
router.get(
	"/kategori_masalah",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'kategori_masalah'),
	],
	kategoriMasalahController.getAll
);
router.get(
	"/kategori_masalah/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'kategori_masalah'),
	],
	kategoriMasalahController.getSearch
);
router.get(
	"/kategori_masalah/:id",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'kategori_masalah'),
	],
	kategoriMasalahController.getByKode
);
router.post(
	"/kategori_masalah",
	[
		authenticate.authenticateToken,
		authenticate.authUser('CREATE', 'kategori_masalah'),
		// validasi
		body("nama_kategori").notEmpty().withMessage("Nama kategori tidak boleh kosong"),
	],
	kategoriMasalahController.createKategori
);
// edit
router.put(
	"/kategori_masalah/:kode",
	[
		authenticate.authenticateToken,
		authenticate.authUser('EDIT', 'kategori_masalah'),
	],
	kategoriMasalahController.editKategori
);
// delete
router.delete(
	"/kategori_masalah/:kode",
	[
		authenticate.authenticateToken,
		authenticate.authUser('DELETE', 'kategori_masalah'),
	],
	kategoriMasalahController.deleteKategori
);
// end
// PENYESUAIAN
// get all
router.get(
	"/penyesuaian_stok_sparepart",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'penyesuaian_stok_sparepart'),
	],
	penyesuaianController.getAll
);
router.get(
	"/penyesuaian_stok_sparepart/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'penyesuaian_stok_sparepart'),
	],
	penyesuaianController.getSearch
);
// get by pk
router.get(
	"/penyesuaian_stok_sparepart/:no_penyesuaian",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'penyesuaian_stok_sparepart'),
	],
	penyesuaianController.getByKode
);
// create
router.post(
	"/penyesuaian_stok_sparepart",
	[
		authenticate.authenticateToken,
		authenticate.authUser('CREATE', 'penyesuaian_stok_sparepart'),
		// validasi
		body("tgl_penyesuaian")
			.notEmpty()
			.withMessage("Tgl Penyesuaian tidak boleh kosong")
			.isDate()
			.withMessage("Format tanggal tidak sesuai"),
		body("kategori").notEmpty().withMessage("Kategori tidak boleh kosong"),
		body("keterangan").notEmpty().withMessage("Keterangan tidak boleh kosong"),
		body("jumlah")
			.notEmpty()
			.withMessage("Jumlah tidak boleh kosong")
			.isNumeric()
			.withMessage("Jumlah harus berupa angka"),
	],
	penyesuaianController.createPenyesuaian
);
// batal
router.delete(
	"/penyesuaian_stok_sparepart/:kode",
	[
		authenticate.authenticateToken,
		authenticate.authUser('DELETE', 'penyesuaian_stok_sparepart'),
	],
	penyesuaianController.deletePenyesuaian
);
// end

// LOG USER
router.get(
	"/log_user",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'log_user'),
	],
	logUserController.getAll
);
router.get(
	"/log_user/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'log_user'),
	],
	logUserController.getSearch
);
// end

// STOK SPAREPART
router.get(
	"/stok_sparepart",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'stok_sparepart'),
	],
	stokSparepart.getAll
);
router.get(
	"/stok_sparepart/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'stok_sparepart'),
	],
	stokSparepart.getSearch
);
// LOG SPAREPART
router.get(
	"/log_sparepart",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'log_sparepart'),
	],
	logSparepartController.getAll
);
router.get(
	"/log_sparepart/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'log_sparepart'),
	],
	logSparepartController.getSearch
);
//  end

// LOG MESIN
router.get(
	"/log_mesin",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'log_mesin'),
	],
	logMesinController.getAll
);
router.get(
	"/log_mesin/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'log_mesin'),
	],
	logMesinController.getSearch
);
// END
// MASALAH
// get all
router.get(
	"/masalah_head",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'masalah_head'),
	],
	masalahController.getAll
);
router.get(
	"/masalah_head/search",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'masalah_head'),
	],
	masalahController.getSearch
);
// get by pk
router.get(
	"/masalah_head/:no_masalah",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'masalah_head'),
	],
	masalahController.getByKode
);
// create masalah
router.post(
	"/masalah_head",
	[
		authenticate.authenticateToken,
		authenticate.authUser('CREATE', 'masalah_head'),
		body("nama_kategori").notEmpty().withMessage("Kategori tidak boleh kosong"),
		body("kode_mesin").notEmpty().withMessage("Kode mesin tidak boleh kosong"),
		body("penyebab").notEmpty().withMessage("Penyebab tidak boleh kosong"),
	],
	masalahController.createMasalah
);
// create penanganan
router.post(
	"/masalah_detail/:no_masalah",
	[
		authenticate.authenticateToken,
		authenticate.authUser('CREATE', 'masalah_detail'),
		body("penanganan").notEmpty().withMessage("Penanganan tidak bolek kosong"),
		body("detail")
			.notEmpty()
			.withMessage("Detail tidak boleh kosong"),
	],
	masalahController.createPenanganan
);
// batal masalah
router.delete(
	"/masalah_head/:no_masalah",
	[
		authenticate.authenticateToken,
		authenticate.authUser('DELETE', 'masalah_head'),
	],
	masalahController.deleteMasalah
);
// batal penanganan
router.delete(
	"/masalah_detail/:no_masalah",
	[
		authenticate.authenticateToken,
		authenticate.authUser('DELETE', 'masalah_detail'),
	],
	masalahController.deletePenanganan
);
// end

// MASALAH DETAIL
// get all
router.get(
	"/masalah_detail",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'masalah_detail'),
	],
	detailMasalahController.getAll
);
// get by pk
router.get(
	"/masalah_detail/:no_masalah",
	[
		authenticate.authenticateToken,
		authenticate.authUser('READ', 'masalah_detail'),
	],
	detailMasalahController.getByKode
);
// EXPORT
module.exports = router;
