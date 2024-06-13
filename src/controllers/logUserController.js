const LogUser = require('../models/logUser')
const utils = require("./utils")

// BASE CONFIGURATION
let config = {
	model: LogUser,
	PK: "id_log_user",
}

const wipeData = () => {
	config = {
		model: LogUser,
		PK: "id_log_user"
	}
}

// GET ALL LOG USER
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
const getSearch = async (req, res) => {
	
	wipeData()

	config.input = req.query.search
	await utils.GetData(config, res)
}

module.exports = {
    getAll,
    getSearch,
}