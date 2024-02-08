const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
// controller
const mesinController = require('../controllers/mesinController')
const sparepartController = require('../controllers/sparepartController')
const penyesuaianController = require('../controllers/penyesuaianController')
const logUserController = require('../controllers/logUserController')
const userController = require('../controllers/userController')
const logSparepartController = require('../controllers/logSparepartController')
const masalahController = require('../controllers/masalahController')
const detailMasalahController = require('../controllers/detailMasalahController')
const authenticateToken = require('../middleware/middleware')

// REGISTER
    router.post('/register', [
        body('username').notEmpty().withMessage('Username tidak boleh kosong'),
        body('password')
            .notEmpty().withMessage('Password tidak boleh kosong')
            .isLength({ min: 8 }).withMessage('Password minimal 8 karakter')
    ], userController.register)

// LOGIN
    router.post('/login', [
        body('username').notEmpty().withMessage('Username tidak boleh kosong'),
        body('password').notEmpty().withMessage('Password tidak boleh kosong')
    ], userController.login)

// DATA USER
    router.get('/data_user', [authenticateToken.authenticateToken], userController.getAll)
    router.get('/data_user/:username', [authenticateToken.authenticateToken], userController.getByKode)
    router.post('/data_user', [
        authenticateToken.authenticateToken,
        body('username').notEmpty().withMessage('Username tidak boleh kosong'),
        body('password')
            .notEmpty().withMessage('Password tidak boleh kosong')
            .isLength({ min: 8 }).withMessage('Password minimal 8 karakter'),
        body('role_id').notEmpty().withMessage('Role user tidak boleh kosong')
    ], userController.createUser)
    router.put('/data_user/:username', [
        authenticateToken.authenticateToken,
        body('username').notEmpty().withMessage('Username tidak boleh kosong'),
        body('password')
            .notEmpty().withMessage('Password tidak boleh kosong')
            .isLength({ min: 8 }).withMessage('Password minimal 8 karakter'),
        body('role_id').notEmpty().withMessage('Role user tidak boleh kosong')
    ], userController.editUser)
    router.delete('/data_user/:username', [authenticateToken.authenticateToken], userController.deleteUser)

// MESIN
    // get all
    router.get('/data_mesin', [authenticateToken.authenticateToken], mesinController.getAll)
    // GET by pk
    router.get('/data_mesin/:kode_mesin', [authenticateToken.authenticateToken], mesinController.getByKode)
    // create
    router.post('/data_mesin', [
        authenticateToken.authenticateToken,
        // validasi
        body('kode_mesin')
            .notEmpty().withMessage('Kode Mesin tidak boleh kosong')
            .isLength({ min: 2 }).withMessage('Kode minimal 2 karakter'),
        body('nama_mesin').notEmpty().withMessage('Nama mesin tidak boleh kosong'),
        body('tgl_beli')
            .notEmpty().withMessage('Tgl beli tidak boleh kosong')
            .isDate().withMessage('Format tanggal tidak sesuai'),
        body('supplier').notEmpty().withMessage('Supplier tidak boleh kosong'),
    ], mesinController.createMesin)
    // edit
    router.put('/data_mesin/:kode', [
        authenticateToken.authenticateToken,
        // validasi
        body('nama_mesin').notEmpty().withMessage('Nama mesin tidak boleh kosong'),
        body('tgl_beli')
            .notEmpty().withMessage('Tgl beli tidak boleh kosong')
            .isDate().withMessage('Format tanggal tidak sesuai'),
        body('supplier').notEmpty().withMessage('Supplier tidak boleh kosong'),
    ], mesinController.editMesin)
    // delete
    router.delete('/data_mesin/:kode', [authenticateToken.authenticateToken], mesinController.deleteMesin)
// end

//SPAREPART
    // get all
    router.get('/data_sparepart', [authenticateToken.authenticateToken], sparepartController.getAll)
    // get by pk
    router.get('/data_sparepart/:kode_sparepart', [authenticateToken.authenticateToken], sparepartController.getByKode)
    // create
    router.post('/data_sparepart', [
        authenticateToken.authenticateToken,
        // validasi
        body('kode_sparepart')
            .notEmpty().withMessage('Kode Sparepart tidak boleh kosong')
            .isLength({ min: 2 }).withMessage('Kode minimal 2 karakter'),
        body('nama_sparepart').notEmpty().withMessage('Nama sparepart tidak boleh kosong'),
        body('merk').notEmpty().withMessage('Merk tidak boleh kosong'),
        body('tipe').notEmpty().withMessage('Tipe tidak boleh kosong'),
        body('satuan').notEmpty().withMessage('Satuan tidak boleh kosong'),
        body('harga_beli')
            .notEmpty().withMessage('Harga beli tidak boleh kosong')
            .isNumeric().withMessage('Harga beli harus berupa angka'),
    ], sparepartController.createSparepart)
    // edit
    router.put('/data_sparepart/:kode', [
        authenticateToken.authenticateToken,
        // validasi
        body('nama_sparepart').notEmpty().withMessage('Nama sparepart tidak boleh kosong'),
        body('merk').notEmpty().withMessage('Merk tidak boleh kosong'),
        body('tipe').notEmpty().withMessage('Tipe tidak boleh kosong'),
        body('satuan').notEmpty().withMessage('Satuan tidak boleh kosong'),
        body('harga_beli')
            .notEmpty().withMessage('Harga beli tidak boleh kosong')
            .isNumeric().withMessage('Harga beli harus berupa angka'),
    ], sparepartController.editSparepart)
    // delete
    router.delete('/data_sparepart/:kode', [authenticateToken.authenticateToken], sparepartController.deleteSparepart)
//  end

// PENYESUAIAN
    // get all
    router.get('/penyesuaian_stok_sparepart', [authenticateToken.authenticateToken], penyesuaianController.getAll)
    // get by pk
    router.get('/penyesuaian_stok_sparepart/:no_penyesuaian', [authenticateToken.authenticateToken], penyesuaianController.getByKode)
    // create
    router.post('/penyesuaian_stok_sparepart', [
        authenticateToken.authenticateToken,
        // validasi
        body('tgl_penyesuaian')
            .notEmpty().withMessage('Tgl Penyesuaian tidak boleh kosong')
            .isDate().withMessage('Format tanggal tidak sesuai'),
        body('kategori').notEmpty().withMessage('Kategori tidak boleh kosong'),
        body('keterangan').notEmpty().withMessage('Keterangan tidak boleh kosong'),
        body('jumlah')
            .notEmpty().withMessage('Jumlah tidak boleh kosong')
            .isNumeric().withMessage('Jumlah harus berupa angka')
    ], penyesuaianController.createPenyesuaian)
    // batal
    router.delete('/penyesuaian_stok_sparepart/:kode', [authenticateToken.authenticateToken], penyesuaianController.deletePenyesuaian)
// end

// LOG USER
    router.get('/log_user', [authenticateToken.authenticateToken], logUserController.getAll)
// end

// LOG SPAREPART
    router.get('/log_sparepart', [authenticateToken.authenticateToken], logSparepartController.getAll)
//  end

// MASALAH
    // get all
    router.get('/masalah_head', [authenticateToken.authenticateToken], masalahController.getAll)
    // get by pk
    router.get('/masalah_head/:no_masalah', [authenticateToken.authenticateToken], masalahController.getByKode)
    // create masalah
    router.post('/masalah_head', [
        authenticateToken.authenticateToken,
        body('tgl_masalah')
            .notEmpty().withMessage('Tgl masalah tidak boleh kosong')
            .isDate().withMessage('Format tanggal tidak sesuai'),
        body('kode_mesin').notEmpty().withMessage('Kode mesin tidak boleh kosong'),
        body('penyebab').notEmpty().withMessage('Penyebab tidak boleh kosong'),
    ], masalahController.createMasalah)
    // create penanganan
    router.post('/penanganan/:no_masalah', [
        authenticateToken.authenticateToken,
        body('penanganan').notEmpty().withMessage('Penanganan tidak bolek kosong'),
        body('waktu_penanganan').notEmpty().withMessage('Waktu penanganan tidak boleh kosong'),
        body('masalah_detail').notEmpty().withMessage('Masalah detail tidak boleh kosong'),
    ], masalahController.createPenanganan)
    // batal masalah
    router.delete('/masalah_head/:no_masalah', [authenticateToken.authenticateToken], masalahController.deleteMasalah)
    // batal penanganan
    router.delete('/penanganan/:no_masalah', [authenticateToken.authenticateToken], masalahController.deletePenanganan)
// end

// MASALAH DETAIL
    // get all
    router.get('/masalah_detail', [authenticateToken.authenticateToken], detailMasalahController.getAll)
    // get by pk
    router.get('/masalah_detail/:no_masalah', [authenticateToken.authenticateToken], detailMasalahController.getByKode)
// EXPORT
module.exports = router