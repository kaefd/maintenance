const LogUser = require('../models/logUser')

// GET ALL LOG USER
const getAll = async (req, res) => {
    const { limit = 10, page = 1 } = req.query;
	const offset = (page - 1) * limit;
    try {
        const logUser = await LogUser.findAll({
            limit: parseInt(limit),
			offset: parseInt(offset),
			order: [["tanggal", "DESC"]],
        })
        const total = await LogUser.findAll()
        var re = page > 1 ? total - (page * limit - limit) -  logUser.length : total.length - logUser.length
        // RESPONSE
		res.status(200).json({
			status: "success",
			code: 200,
			page: parseInt(page),
			limit: parseInt(limit),
			rows: logUser.length,
			totalData: total.length,
			remainder: re || 0,
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
const getSearch = async (req, res) => {
	const input = req.query.search
	try {
		let user = await LogUser.findAll()
		if (!user) return res.status(404).json({
			status: "error",
			code: 404,
			message: ["data tidak ditemukan"]
		});
		console.log('user');
		let nwuser = user.map(i => i.dataValues)
		const search = input ? nwuser.filter(item => Object.values(item).some(value => typeof value == 'string' && value.toLowerCase().includes(input.toLowerCase()))) : user
		console.log(search);
		// RESPONSE
		res.status(200).json({
			status: "success",
			code: 200,
			page: 1,
			limit: parseInt(search.length),
			rows: search.length,
			totalData: search.length,
			remainder: 0,
			data: search,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: error|| ["Internal server error"],
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
    getSearch,
    createLog,
}