const LogSparepart = require('../models/logSparepartModel');
const utils = require("./utils")

// BASE CONFIGURATION
let config = {
	model: LogSparepart,
	PK: "id_log_sparepart",
}

const wipeData = () => {
	config = {
		model: LogSparepart,
		PK: "id_log_sparepart"
	}
}

// GET ALL LOG SPAREPART
const getAll = async (req, res) => {

	wipeData()

	let whereCondition = Object.fromEntries(
		Object.entries(req.query).filter(
			([key, value]) => key != "limit" && key != "page"
		)
	);
	config.limit = req.query.limit
	config.page = req.query.page
	config.whereCondition = whereCondition
	await utils.GetData(config, res)
}
// SEARCH
const getSearch = async (req, res) => {

	wipeData()
	
	config.input = req.query.search
	await utils.GetData(config, res)
}

module.exports = {
    getAll,
    getSearch,
}