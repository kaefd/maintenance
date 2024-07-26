const { Op } = require("sequelize");
const bcrypt = require('bcrypt')
var ntpClient = require('ntp-client')
const Penyesuaian = require("../models/penyesuaianModel");
const Masalah = require("../models/masalahModel");
const Penanganan = require("../models/penangananModel");

const formaterPK = async (subject) => {
	const th = new Date().getFullYear().toString().slice(2, 4);
	const mt =
		(new Date().getMonth() + 1).length > 1
			? (new Date().getMonth() + 1).toString()
			: "0" + (new Date().getMonth() + 1);
    let kode = ''
	let last = ''
    if(subject == 'penyesuaian') {
        kode = "PNY-" + th + mt;
        const no = await Penyesuaian.findOne({
            limit: 1,
            where: {
                no_penyesuaian: {
                    [Op.like]: `%${kode}%`,
                },
            },
            order: [ ['no_penyesuaian', 'DESC']]
        })
        last = no ? no.no_penyesuaian : ''
    }
    if(subject == 'masalah') {
        kode = "MSL-" + th + mt;
        const no = await Masalah.findOne({
            limit: 1,
            where: {
                no_masalah: {
                    [Op.like]: `%${kode}%`,
                },
            },
            order: [ ['no_masalah', 'DESC']]
        })
        last = no ? no.no_masalah : ''
    }
    if(subject == 'penanganan') {
        kode = "PGN-" + th + mt;
        const no = await Penanganan.findOne({
            limit: 1,
            where: {
                no_penanganan: {
                    [Op.like]: `%${kode}%`,
                },
            },
            order: [ ['no_penanganan', 'DESC']]
        })
        last = no ? no.no_penanganan : ''
    }
	const urut = last != '' ? Number(last.slice(8, 11)) + 1 : 1
	const kode_urut =
		urut.toString().length == 1
			? "00" + urut.toString()
			: urut.length == 2
			? "0" + urut
			: urut;
	return (kode + kode_urut)
}
const isDuplicated = (key, value, data) => {
    let a = data.filter(d => d[key] == value)
    if(a.length > 1) return true
    else return false
}
const now = () => {
    return ntpClient.getNetworkTime("pool.ntp.org", 123, function(err, date) {
        if(err) {
            console.error(err);
            return;
        }
        return date.toString()
    });
}
const generateHash = async (pass) => {
    const saltRounds = 12;
    const hash = await bcrypt.hash(pass, saltRounds);
    return hash.toString();
}

module.exports = {
    formaterPK,
    isDuplicated,
    now,
    generateHash
}