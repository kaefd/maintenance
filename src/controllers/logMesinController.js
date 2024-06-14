const utils = require("./utils")
const LogMesin = require('../models/logMesinModel');
const Mesin = require('../models/mesinModel');

// BASE CONFIGURATION
let config = {
	model: LogMesin,
	PK: "id",
	hideFields: ["id"],
	modelAssociation: [
		{
			toModel: Mesin,
			relation: "hasMany",
			model: LogMesin,
			fk: "kode_mesin"
		},
		{
			toModel: LogMesin,
			relation: "belongsTo",
			model: Mesin,
			fk: "kode_mesin"
		}
	],
	include: [
		{
			model: Mesin,
			strModel: "Mesin",
			attributes: ["nama_mesin"]
		}
	]
};
const wipeData = () => {
	config = {
		model: LogMesin,
		PK: "id",
		hideFields: ["id"],
		modelAssociation: [
			{
				toModel: Mesin,
				relation: "hasMany",
				model: LogMesin,
				fk: "kode_mesin"
			},
			{
				toModel: LogMesin,
				relation: "belongsTo",
				model: Mesin,
				fk: "kode_mesin"
			}
		],
		include: [
			{
				model: Mesin,
				strModel: "Mesin",
				attributes: ["nama_mesin"]
			}
		]
	};
}
// GET ALL LOG
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
	
	let whereCondition = Object.fromEntries(
		Object.entries(req.query).filter(
			([key, value]) => key != "limit" && key != "page" && key != "search"
		)
	);
	config.input = req.query.search
	config.limit = req.query.limit
	config.page = req.query.page
	config.whereCondition = whereCondition
	await utils.GetData(config, res)
}
module.exports = {
    getAll,
    getSearch,
}