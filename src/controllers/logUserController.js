const LogUser = require('../models/logUser')

// GET ALL LOG USER
const getAll = async (req, res) => {
    const { limit = 10, page = 1 } = req.query;
	const offset = (page - 1) * limit;
    try {
        const logUser = await LogUser.findAll({
            limit: parseInt(limit),
			offset: parseInt(offset),
        })
        // RESPONSE
		res.status(200).json({
			status: "success",
			code: 200,
			data: logUser,
		});
    } catch (error) {
        res.status(500).json({
			status: "error",
			code: 500,
			message: error|| "Internal server error",
		});
    }
}
// CREATE LOG
const createLog = async (kategori, keterangan, user, transaction) => {
    try {
        const tanggal = new Date().toISOString()
        const kode_user = user
        const data = await LogUser.create({
            tanggal,
            kode_user,
            kategori,
            keterangan,
        }, { transaction: transaction })
        return data
    } catch (error) {
        return { error: error }
    }
}

module.exports = {
    getAll,
    createLog,
}