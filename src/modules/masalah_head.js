const Masalah = require("../models/masalahModel")

const config = {
    pk: "no_masalah",
    key: "masalah",
    model: Masalah,
    search: true,
    whereCondition: ["open", "close"],
    order: "DESC",
    orderBy: "no_masalah",
    assoc: {
        model: "Mesin",
        relation: ["hasMany", "belongsTo"],
        fk: "kode_mesin",
        required: true,
        attributes: ['nama_mesin']
    },
    fields: [
        {key: "no_masalah", name: "No Masalah", type: "String", get: true, post: {show: true, auto: true}, put: false, delete: true },
        {key: "nama_kategori", name: "Nama Kategori", type: "String", get: true, post: {show: true, auto: false}, put: false, delete: false },
        {key: "tgl_masalah", name: "Tgl Masalah", type: "Date", get: true, post: {show: true, auto: false}, put: false, delete: false },
        {key: "kode_mesin", name: "Kode Mesin", type: "String", get: true, post: {show: true, auto: false}, put: false, delete: false },
        {key: "nama_mesin", name: "Nama Mesin", type: "String", get: true, post: {show: true, auto: false}, put: false, delete: false },
        {key: "penyebab", name: "Penyebab", type: "String", get: true, post: {show: true, auto: false}, put: false, delete: false },
        {key: "keterangan_masalah", name: "Keterangan Masalah", type: "String", get: true, post: {show: true, auto: false}, put: false, delete: false },
        {key: "penanganan", name: "Penanganan", type: "String", get: true, post: {show: true, auto: false}, put: false, delete: false },
        {key: "tgl_penanganan", name: "Tgl Penanganan", type: "String", get: true, post: {show: true, auto: false}, put: false, delete: false },
        {key: "waktu_penanganan", name: "Waktu Penanganan", type: "String", get: true, post: {show: true, auto: false}, put: false, delete: false },
        {key: "created_by", name: "Created By", type: "String", get: true, post: {show: true, auto: false}, put: false, delete: false },
        {key: "created_date", name: "Created Date", type: "date", get: true, post: {show: true, auto: false}, put: false, delete: false },
        {key: "deleted_by", name: "Deleted By", type: "String", get: true, post: {show: true, auto: false}, put: false, delete: false },
        {key: "deleted_date", name: "Deleted Date", type: "date", get: true, post: {show: true, auto: false}, put: false, delete: false },
        {key: "status", name: "Status", type: "String", get: true, post: {show: true, auto: false}, put: false, delete: false },
    ]
}

module.exports = {
    config
}