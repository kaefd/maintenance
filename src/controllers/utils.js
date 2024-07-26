const { validationResult } = require("express-validator")
const { where } = require("sequelize")
const utils = require("../utils/utils")

// GET
const GetData = async (config, res) => {

    /** REQUIRED
     * 
     *  config.model
     *  config.whereCondition
     * 
     */

    // MODEL ASSOCIATION
    if(config.modelAssociation) {
        for (let i = 0; i < config.modelAssociation.length; i++) {
            let toModel = config.modelAssociation[i].toModel
            let relation = config.modelAssociation[i].relation
            let model = config.modelAssociation[i].model
            toModel[relation](model, {foreignKey: config.modelAssociation[i].fk})
        }
    }
    try {
        
        const whereCondition = config.whereCondition
        const model = config.model
        // GET ALL DATA
        let allData = await model.findAll({ 
            where: whereCondition,
            include: config.include ?? null
         })
        allData = allData.map(i => i.dataValues)

        // LIMIT, PAGE & OFFSET
        const limit = config.limit ? (config.limit * 0 == 0 ? config.limit : allData.length) : 10
        const page = config.page ?? 1
        const offset = (page - 1) * limit

        let total = allData.length
        let data = await model.findAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
            where: whereCondition,
            order: config.order ?? [[config.PK, "ASC"]],
            include: config.include ?? null
        })
        data = data.map(i => i.dataValues)

        // DATA BY PK
        if(config.byPK) {
            data = await model.findAll({ 
                where: { [config.PK]: config.byPK },
                include: config.include ?? null
            })

            data = data.length > 0 ? data.map(el => el.dataValues)[0] : false
            
            total = data[config.PK] ? 1 : 0
            if(config.hideFields) {
                data = data ? Object.fromEntries(Object.entries(data).filter(([key]) => config.hideFields.filter(el => el == key) == "" )) : false
            }
            data = data ? [data] : []
        }
        // ERROR CONDITIONAL
        if(!data) throw ["Data tidak ditemukan"]
        // MAPPING DATA
        if(config.modelAssociation) {
            for (let i = 0; i < config.include.length; i++) {
                data = data.map(el => {
                    let newObject = {
                        ...el,
                        [config.include[i].attributes]: el[config.include[i].strModel][config.include[i].attributes]
                    }
                    return Object.fromEntries(Object.entries(newObject).filter(([key]) => key != config.include[i].strModel));
                })
                allData = allData.map(el => {
                    let newObject = {
                        ...el,
                        [config.include[i].attributes]: el[config.include[i].strModel][config.include[i].attributes]
                    }
                    return Object.fromEntries(Object.entries(newObject).filter(([key]) => key != config.include[i].strModel));
                })
            }
        }
        if(config.hideFields) {
            data = data.map(el => { return Object.fromEntries(Object.entries(el).filter(([key]) => config.hideFields.filter(el => el == key) == "" )) })
            allData = allData.map(el => { return Object.fromEntries(Object.entries(el).filter(([key]) => config.hideFields.filter(el => el == key) == "" )) })
        }
        // DATA BY KEYWORD IN SEARCH
        if(config.input) {
            data = allData.filter(item => Object.values(item).some(value => typeof value == 'string' && value.toLowerCase().includes(config.input.toLowerCase()))) ?? []
            total = data.length
        }

        if(config.byPK) {
            data = data.length > 0 ? data[0] : {}
        }

        // RETURN RESULT
        res.status(200).json({
			status: "success",
			code: 200,
			data: data,
            pagination: {
                currentPage: parseInt(page),
                itemsPerPage: parseInt(limit),
                totalItems: total,
                totalPages: data.length >= limit ? parseInt(total % limit != 0 ? total/limit+1 : total/limit) : 1
            }
		});
    } catch (error) {
        res.status(500).json({
			status: "error",
			code: 500,
			message: error ?? ["Internal Server Error"],
		});
    }
}
// PAYLOAD VALIDATION
const Validate = async (req, res, check) => {

    /** REQUIRED
     * 
     *  check[index].check
     * 
     */

    let errors = req ? validationResult(req).array().map(er => { return er.msg ?? er.message }) : []
    for (let i = 0; i < check.length; i++) {
        if(check[i].check == "isEmpty") {
            /** REQUIRED
             * 
             *  ~ data : array
             *  ~ field : array
             * 
             */
            for (let j = 0; j < check[i].field.length; j++) {
                let checkValue = check[i].data.map(el => el[check[i].field[j].key])[0]
                if(!checkValue || checkValue == "") {
                    errors.push(check[i].field[j].message ?? `${check[i].field[j].title} tidak boleh kosong`)
                }
            }
        }
        if(check[i].check == "isAvailable" || check[i].check == "isDuplicate") {
            /** REQUIRED
             * 
             *  ~ model
             *  ~ whereCondition
             * 
             */
            let model, PK
            if(check[i].model) {
                model = check[i].model     
                PK = await model.findOne({
                    where: check[i].whereCondition
                })
            }
            if(check[i].check == "isAvailable") {
                if(check[i].model && !PK) errors.push( check[i].message ?? `${check[i].title} tidak ditemukan` )
            }
            if(check[i].check == "isDuplicate") {
                /** REQUIRED
                 * 
                 *  ~ data : array
                 *  ~ field : array
                 * 
                 */
                if(check[i].model && PK ) errors.push( check[i].message ?? `${check[i].title} sudah terdaftar` )
                    else if(!check[i].model) {
                        for (let j = 0; j < check[i].field.length; j++) {
                            let checkValue = check[i].data.map(el => el[check[i].field[j].key])[0]
                            let isDuplicate = utils.isDuplicated(check[i].field[j].key, checkValue, check[i].data)
                            if(isDuplicate) errors.push(check[i].message ?? `${checkValue} sudah ada`)
                        }
                }
            }
        }
        if(check[i].check == ">=") {
            /** REQUIRED
             * 
             *  ~ model
             *  ~ whereCondition
             *  ~ parameter : array
             * 
             */
            let model = await check[i].model
            let data = await model.findOne({ where: check[i].whereCondition })
            if(!data) errors.push( check[i].message ?? "Sparepart tidak mencukupi" )
            if(data[check[i].parameter[0]] < check[i].parameter[1]) errors.push( check[i].message ?? "Stok tidak mencukupi" )
        }
        if(check[i].check == "byCategories") {
            /** REQUIRED
             * 
             *  ~ kategori : array
             *  ~ value
             * 
             */
            let categories = check[i].kategori
            if(categories.find(el => el == check[i].value) == null) errors.push( check[i].message ?? "kategori tidak sesuai" )
        }
    }

    if(errors.length > 0) {
        return res ? res.status(400).json({
            status: "error",
            code: 400,
            message: errors ?? ["Validation Error"],
        }) :
        {
            status: "error",
            code: 400,
            message: errors ?? ["Validation Error"],
        }
    }
    else return false
}

// POST
const CreateData = async (req, config, transaction) => {
    /** REQUIRED
     * 
     *  config.model
     *  config.data
     * 
     */
    try {
        let model = config.model
        let data = config.data
        if(config.time_user_stamp) {
            data.created_by = req.session.user
            data.created_date = new Date()
            data.deleted_by = ""
            data.deleted_date = new Date(1)
        }
        let result = await model.create(data, {transaction: transaction})

        if(config.hideFields) {
            result = result.dataValues
            result = Object.fromEntries(Object.entries(result).filter(([key]) => key != config.hideFields))
        }

        // CREATE LOG
        if(config.log) {
            for (let i = 0; i < config.log.length; i++) {
                let model = config.log[i].model
                await model.create(config.log[i].data, {transaction: transaction})
            }
        }

        return result
    } catch (error) {
        return {error: [error] ?? ["Create data error"]}
    }
}
// UPDATE
const UpdateData = async (req, config, transaction) => {
    try {
        /** REQUIRED
         * 
         * config.model
         * config.data: must contain an id or pk value ex. data.{primary_key}
         * config.PK
         * 
         */
        const model = config.model
        const data = config.data

        let singleData = await model.findByPk(data[config.PK])

        const result = await singleData.update(data, {transaction: transaction})
        result.save()

        // CREATE LOG
        if(config.log) {
            for (let i = 0; i < config.log.length; i++) {
                let model = config.log[i].model
                await model.create(config.log[i].data, {transaction: transaction})
            }
        }

        return result
    } catch (error) {
        return { error: [error] ?? ["Create data error"] }
    }
}
// DELETE
const DeleteData = async (req, config, transaction) => {
    /** REQUIRED
     * 
     *  config.model
     *  config.data
     * 
     */
    try {
        const model = config.model
        await model.destroy(
            {
                where: config.data
            },{transaction: transaction})

        // CREATE LOG
        if(config.log) {
            for (let i = 0; i < config.log.length; i++) {
                let model = config.log[i].model
                await model.create(config.log[i].data, {transaction: transaction})
            }
        }
        return true
    } catch (error) {
        return { error: [error] ?? ["Delete error"] }
    }
}


module.exports = {
    GetData,
    Validate,
    CreateData,
    UpdateData,
    DeleteData,
}