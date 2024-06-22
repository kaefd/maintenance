
# API - Maintenance System


### Tech Stack

Node, Express


### Endpoints

| endpoint            | method                                 |
| :-------------------| :--------------------------------------|
| [`register`](#register)         | `POST`                                 |
| [`login`](#login)            | `POST`                                 |
| [`permission`](#permission)       | `GET` `POST` `PUT` `DELETE`|
| [`role`](#role)             | `GET` `POST` `PUT` `DELETE`|
| [`data_user`](#data-user)        | `GET` `POST` `PUT` `DELETE`|
| [`data_mesin`](#data-mesin)       | `GET` `POST` `PUT` `DELETE`|
| [`data_sparepart`](#data-sparepart)   | `GET` `POST` `PUT` `DELETE`|
| [`kategori_masalah`](#kategori-masalah) | `GET` `POST` `PUT` `DELETE`|
| [`penyesuaian_stok`](#penyesuaian-stok) | `GET` `POST` `DELETE`          |
| [`masalah`](#masalah)          | `GET` `POST` `DELETE`          |
| [`masalah_detail`](#detail-masalah)   | `GET` `POST` `DELETE`          |
| [`log_mesin`](#log-mesin)        | `GET`                                  |
| [`log_sparepart`](#log-sparepart)    | `GET`                                  |
| [`log_user`](#log-user)         | `GET`                                  |





## API Reference

### Register

- Header
```
  POST /api/register
```
- Body
```
  {
    "username": String,
    "password": String
  }
```
- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Registrasi berhasil"
  ]
}
```
```
NOTE: new user must be activated by admin
```

### Login
- Header
```
  POST /api/login
```
- Body
```
  {
    "username": String,
    "password": String
  }
```
- Response
```
{
    "token": token
}
```

### Permission
#### Get All Data
- Header
```
  GET /api/permission
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `page`    | `number` | default: 1 |
| `limit`   | `number` | default: 10 |

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "method": String,
      "table": String,
      "nama_role": String
    }
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Get data
- Header
```
  GET /api/permission/${id}
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. Your API key        |
| `id`      | `string` | **Required**. Id of item to fetch |
- Response
```
{
  "status": "success",
  "code": 200,
  "data": {
      "role_id": Number
      "method": String,
      "table": String,
      "nama_role": String
    },
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Create data
- Header
```
  POST /api/permission
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |

- Body
```
{
    "role_id": Number,
    "nama_role": String,
    "method": {
      "READ": Boolean,
      "CREATE": Boolean,
      "EDIT": Boolean,
      "DELETE": Boolean,
    },
    "table": String
} 
```
- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil menambahkan data"
  ],
}
```
#### Update Data
- Header
```
  PUT /api/permission/${id}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `id`      | `string` | **Required**. id of item to fetch |

- Body
```
{
    "role_id": Number,
    "nama_role": String,
    "method": {
      "READ": Boolean,
      "CREATE": Boolean,
      "EDIT": Boolean,
      "DELETE": Boolean,
    },
    "table": String
} 
```
- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil mengubah data"
  ],
}
```
#### Delete data
- Header
```
  DELETE /api/permission/${id}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `id`      | `string` | **Required**. id of item to fetch |

- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil menghapus data"
  ],
}
```
### Role
#### Get All Data
- Header
```
  GET /api/role
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `page`    | `number` | default: 1 |
| `limit`   | `number` | default: 10 |

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "nama_role": String
    }
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Get data
- Header
```
  GET /api/role/${id}
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. Your API key        |
| `id`      | `string` | **Required**. Id of item to fetch |
- Response
```
{
  "status": "success",
  "code": 200,
  "data": {
      "nama_role": String
    },
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Search data
- Header
```
  GET /api/role/search
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `search`  | `string` | **Required**. search to fetch data|

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "nama_role": String
    }
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Create data
- Header
```
  POST /api/role
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |

- Body
```
{
    "nama_role": String,
} 
```
- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil menambahkan data"
  ],
  "data": {
    "nama_role": String
  }
}
```
#### Update Data
- Header
```
  PUT /api/role/${id}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |
| `id`      | `string` | **Required**. id of item to fetch |

- Body
```
{
    "nama_role": String,
} 
```
- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil mengubah data"
  ],
}
```
#### Delete data
- Header
```
  DELETE /api/role/${id}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |
| `id`      | `string` | **Required**. id of item to fetch |

- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil menghapus data"
  ],
}
```

### Data user
#### Get All Data
- Header
```
  GET /api/data_user
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `page`    | `number` | default: 1 |
| `limit`   | `number` | default: 10 |

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "username": String,
      "role_id": Number,
      "created_by": String,
      "created_date": String,
      "deleted_by: String,
      "deleted_date": String,
      "status": String,
      "nama_role": String,
    },
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Get data
- Header
```
  GET /api/data_user/${username}
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. Your API key        |
| `username`      | `string` | **Required**. username of item to fetch |
- Response
```
{
  "status": "success",
  "code": 200,
  "data": {
      "username": String,
      "role_id": Number,
      "created_by": String,
      "created_date": String,
      "deleted_by: String,
      "deleted_date": String,
      "status": String,
      "nama_role": String,
    },
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Search data
- Header
```
  GET /api/data_user/search
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `search`  | `string` | **Required**. search to fetch data|

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "username": String,
      "role_id": Number,
      "created_by": String,
      "created_date": String,
      "deleted_by: String,
      "deleted_date": String,
      "status": String,
      "nama_role": String,
    },
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Create data
- Header
```
  POST /api/data_user
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |

- Body
```
{
  "username": String,
  "password": String,
  "nama_role": String,
}
```
- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil menambahkan data"
  ]
}
```
#### Update Data
- Header
```
  PUT /api/data_user/${username}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |
| `username`      | `string` | **Required**. username of item to fetch |

- Body
```
{
    "nama_role": String,
    "password: String
} 
```
- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil mengubah data"
  ]
}
```
#### Delete data
- Header
```
  DELETE /api/data_user/${username}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |
| `username`      | `string` | **Required**. username of item to fetch |

- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil menghapus data"
  ],
}
```
### Data Mesin
#### Get All Data
- Header
```
  GET /api/data_mesin
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `page`    | `number` | default: 1 |
| `limit`   | `number` | default: 10 |

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "kode_mesin": String
      "nama_mesin": String
      "keterangan": String
      "tgl_beli": String,
      "supplier": String,
      "created_by": String,
      "created_date": String,
      "deleted_by": String,
      "deleted_date": String,
      "status": String,
    },
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Get data
- Header
```
  GET /api/data_mesin/${kode_mesin}
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. Your API key        |
| `kode_mesin`      | `string` | **Required**. kode_mesin of item to fetch |
- Response
```
{
  "status": "success",
  "code": 200,
  "data": {
      "kode_mesin": String
      "nama_mesin": String
      "keterangan": String
      "tgl_beli": String,
      "supplier": String,
      "created_by": String,
      "created_date": String,
      "deleted_by": String,
      "deleted_date": String,
      "status": String,
    },
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Search data
- Header
```
  GET /api/data_mesin/search
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `search`  | `string` | **Required**. search to fetch data|

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "kode_mesin": String
      "nama_mesin": String
      "keterangan": String
      "tgl_beli": String,
      "supplier": String,
      "created_by": String,
      "created_date": String,
      "deleted_by": String,
      "deleted_date": String,
      "status": String,
    },
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Create data
- Header
```
  POST /api/data_mesin
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |

- Body
```
{
  "kode_mesin": String
  "nama_mesin": String
  "keterangan": String
  "tgl_beli": String,
  "supplier": String,
}
```
- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil menambahkan data"
  ],
  data: {
      "kode_mesin": String
      "nama_mesin": String
      "keterangan": String
      "tgl_beli": String,
      "supplier": String,
      "created_by": String,
      "created_date": String,
      "deleted_by": String,
      "deleted_date": String,
      "status": String,
    }
}
```
#### Update Data
- Header
```
  PUT /api/data_mesin/${kode_mesin}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |
| `kode_mesin`      | `string` | **Required**. kode_mesin of item to fetch |

- Body
```
{
  "kode_mesin": String
  "nama_mesin": String
  "keterangan": String
  "tgl_beli": String,
  "supplier": String,
} 
```
- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil mengubah data"
  ]
}
```
#### Delete data
- Header
```
  DELETE /api/data_mesin/${kode_mesin}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |
| `kode_mesin`      | `string` | **Required**. kode_mesin of item to fetch |

- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil menghapus data"
  ],
}
```
### Data Sparepart
#### Get All Data
- Header
```
  GET /api/data_sparepart
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `page`    | `number` | default: 1 |
| `limit`   | `number` | default: 10 |

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "kode_sparepart": String,
      "nama_sparepart": String,
      "merk": String,
      "tipe": String,
      "satuan": String,
      "harga_beli": Number,
      "stok_minus": Number,
      "stok_akhir": Number,
      "created_by": String,
      "created_date": String,
      "deleted_by": String,
      "deleted_date": String,
      "status": String
    },
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Get data
- Header
```
  GET /api/data_sparepart/${kode_sparepart}
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. Your API key        |
| `kode_sparepart`      | `string` | **Required**. kode_sparepart of item to fetch |
- Response
```
{
  "status": "success",
  "code": 200,
  "data": {
      "kode_sparepart": String,
      "nama_sparepart": String,
      "merk": String,
      "tipe": String,
      "satuan": String,
      "harga_beli": Number,
      "stok_minus": Number,
      "stok_akhir": Number,
      "created_by": String,
      "created_date": String,
      "deleted_by": String,
      "deleted_date": String,
      "status": String
    },
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Search data
- Header
```
  GET /api/data_sparepart/search
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `search`  | `string` | **Required**. search to fetch data|

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "kode_sparepart": String,
      "nama_sparepart": String,
      "merk": String,
      "tipe": String,
      "satuan": String,
      "harga_beli": Number,
      "stok_minus": Number,
      "stok_akhir": Number,
      "created_by": String,
      "created_date": String,
      "deleted_by": String,
      "deleted_date": String,
      "status": String
    },
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Create data
- Header
```
  POST /api/data_sparepart
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |

- Body
```
{
  "kode_sparepart": String,
  "nama_sparepart": String,
  "merk": String,
  "tipe": String,
  "satuan": String,
  "harga_beli": Number,
  "stok_minus": Number,
  "status": String
}
```
- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil menambahkan data"
  ],
  data: {
      "kode_sparepart": String,
      "nama_sparepart": String,
      "merk": String,
      "tipe": String,
      "satuan": String,
      "harga_beli": Number,
      "stok_minus": Number,
      "stok_akhir": Number,
      "created_by": String,
      "created_date": String,
      "deleted_by": String,
      "deleted_date": String,
      "status": String
    },
  ],
}
```
#### Update Data
- Header
```
  PUT /api/data_sparepart/${kode_sparepart}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |
| `kode_sparepart`      | `string` | **Required**. kode_sparepart of item to fetch |

- Body
```
{
  "kode_sparepart": String,
  "nama_sparepart": String,
  "merk": String,
  "tipe": String,
  "satuan": String,
  "harga_beli": Number,
  "stok_minus": Number,
  "status": String
}
```
- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil mengubah data"
  ]
}
```
#### Delete data
- Header
```
  DELETE /api/data_sparepart/${kode_sparepart}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |
| `kode_sparepart`      | `string` | **Required**. kode_sparepart of item to fetch |

- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil menghapus data"
  ],
}
```
### Kategori Masalah
#### Get All Data
- Header
```
  GET /api/kategori_masalah
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `page`    | `number` | default: 1 |
| `limit`   | `number` | default: 10 |

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "nama_kategori": String
    },
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Get data
- Header
```
  GET /api/kategori_masalah/${id}
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. Your API key        |
| `id`      | `string` | **Required**. Id of item to fetch |
- Response
```
{
  "status": "success",
  "code": 200,
  "data": {
      "nama_kategori": String
    },
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Search data
- Header
```
  GET /api/kategori_masalah/search
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `search`  | `string` | **Required**. search to fetch data|

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "nama_kategori": String
    },
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Create data
- Header
```
  POST /api/kategori_masalah
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |

- Body
```
{
  "nama_kategori": String
}
```
- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil menambahkan data"
  ],
  data: {
    "id_kategori": Number,
    "nama_kategori": String
  },
}
```
#### Update Data
- Header
```
  PUT /api/kategori_masalah/${id}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |
| `id`      | `string` | **Required**. id of item to fetch |

- Body
```
{
  "id_kategori": Number,
  "nama_kategori": String
}
```
- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil mengubah data"
  ]
}
```
#### Delete data
- Header
```
  DELETE /api/kategori_masalah/${id}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |
| `id`      | `string` | **Required**. id of item to fetch |

- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil menghapus data"
  ],
}
```
### Penyesuaian stok_akhir
#### Get All Data
- Header
```
  GET /api/penyesuaian_stok
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `page`    | `number` | default: 1 |
| `limit`   | `number` | default: 10 |

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "no_penyesuaian": String,
      "tgl_penyesuaian": String,
      "kode_sparepart": String,
      "kategori": String,
      "keterangan": String,
      "jumlah": Number,
      "created_by": String,
      "created_date": String,
      "deleted_by": String,
      "deleted_date": String,
      "status": String
    }
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Get data
- Header
```
  GET /api/penyesuaian_stok/${no_penyesuaian}
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. Your API key        |
| `no_penyesuaian`      | `string` | **Required**. no_penyesuaian of item to fetch |
- Response
```
{
  "status": "success",
  "code": 200,
  "data": {
      "no_penyesuaian": String,
      "tgl_penyesuaian": String,
      "kode_sparepart": String,
      "kategori": String,
      "keterangan": String,
      "jumlah": Number,
      "created_by": String,
      "created_date": String,
      "deleted_by": String,
      "deleted_date": String,
      "status": String
    },
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Search data
- Header
```
  GET /api/penyesuaian_stok/search
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `search`  | `string` | **Required**. search to fetch data|

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "no_penyesuaian": String,
      "tgl_penyesuaian": String,
      "kode_sparepart": String,
      "kategori": String,
      "keterangan": String,
      "jumlah": Number,
      "created_by": String,
      "created_date": String,
      "deleted_by": String,
      "deleted_date": String,
      "status": String
    }
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Create data
- Header
```
  POST /api/penyesuaian_stok
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |

- Body
```
{
  "kode_sparepart": String,
  "kategori": String,
  "keterangan": String,
  "jumlah": Number,
}
```
- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil menambahkan data"
  ],
  data: {
      "no_penyesuaian": String,
      "tgl_penyesuaian": String,
      "kode_sparepart": String,
      "kategori": String,
      "keterangan": String,
      "jumlah": Number,
      "created_by": String,
      "created_date": String,
      "deleted_by": String,
      "deleted_date": String,
      "status": String
    }
  ],
}
```
#### Delete data
- Header
```
  DELETE /api/penyesuaian_stok/${no_penyesuaian}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |
| `no_penyesuaian`      | `string` | **Required**. no_penyesuaian of item to fetch |

- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil menghapus data"
  ],
}
```
### Masalah
#### Get All Data
- Header
```
  GET /api/masalah
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `page`    | `number` | default: 1 |
| `limit`   | `number` | default: 10 |
| `status`   | `string` | default: `open` & `close` |

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
     {
      "no_masalah": String,
      "nama_kategori": String,
      "tgl_masalah": String,
      "kode_mesin": String,
      "penyebab": String,
      "keterangan_masalah": String,
      "penanganan": String,
      "tgl_penanganan": String,
      "total_biaya": Number,
      "created_by": String,
      "user_penanganan": String,
      "created_date": String,
      "deleted_by": String,
      "deleted_date": String,
      "status": String,
      "nama_mesin": String,
    }
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Get data
- Header
```
  GET /api/masalah/${no_masalah}
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. Your API key        |
| `no_masalah`      | `string` | **Required**. no_masalah of item to fetch |
- Response
```
{
  "status": "success",
  "code": 200,
  "data": {
      "no_masalah": String,
      "nama_kategori": String,
      "tgl_masalah": String,
      "kode_mesin": String,
      "penyebab": String,
      "keterangan_masalah": String,
      "penanganan": String,
      "tgl_penanganan": String,
      "total_biaya": Number,
      "created_by": String,
      "user_penanganan": String,
      "created_date": String,
      "deleted_by": String,
      "deleted_date": String,
      "status": String,
      "nama_mesin": String,
    },
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Search data
- Header
```
  GET /api/masalah/search
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `search`  | `string` | **Required**. search to fetch data|

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "no_masalah": String,
      "nama_kategori": String,
      "tgl_masalah": String,
      "kode_mesin": String,
      "penyebab": String,
      "keterangan_masalah": String,
      "penanganan": String,
      "tgl_penanganan": String,
      "total_biaya": Number,
      "created_by": String,
      "user_penanganan": String,
      "created_date": String,
      "deleted_by": String,
      "deleted_date": String,
      "status": String,
      "nama_mesin": String,
    }
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Create Masalah
- Header
```
  POST /api/masalah
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |

- Body
```
{
  "nama_kategori": String,
  "kode_mesin": String,
  "penyebab": String,
  "keterangan_masalah": String,
}
```
- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil menambahkan data"
  ],
  data: {
      "no_masalah": String,
      "nama_kategori": String,
      "tgl_masalah": String,
      "kode_mesin": String,
      "penyebab": String,
      "keterangan_masalah": String,
      "penanganan": String,
      "tgl_penanganan": String,
      "total_biaya": Number,
      "created_by": String,
      "user_penanganan": String,
      "created_date": String,
      "deleted_by": String,
      "deleted_date": String,
      "status": String,
      "nama_mesin": String,
    }
  ],
}
```
#### Delete Masalah
- Header
```
  DELETE /api/masalah/${no_masalah}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |
| `no_masalah`      | `string` | **Required**. no_masalah of item to fetch |

- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil membatalkan masalah"
  ],
}
```
### Detail Masalah
#### Get All Data
- Header
```
  GET /api/masalah_detail
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `page`    | `number` | default: 1 |
| `limit`   | `number` | default: 10 |

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
     {
      "no_masalah": String,
      "no_urut": String,
      "kode_sparepart": String,
      "jumlah": Number,
      "biaya": Number,
      "keterangan": String
    }
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Get data
- Header
```
  GET /api/masalah_detail/${no_masalah}
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. Your API key        |
| `no_masalah`      | `string` | **Required**. no_masalah of item to fetch |
- Response
```
{
  "status": "success",
  "code": 200,
  "data": {
      "no_masalah": String,
      "no_urut": String,
      "kode_sparepart": String,
      "jumlah": Number,
      "biaya": Number,
      "keterangan": String
    },
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Search data
- Header
```
  GET /api/masalah_detail/search
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `search`  | `string` | **Required**. search to fetch data|

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "no_masalah": String,
      "no_urut": String,
      "kode_sparepart": String,
      "jumlah": Number,
      "biaya": Number,
      "keterangan": String
    }
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Create Penanganan
- Header
```
  POST /api/masalah_detail/${no_masalah}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |
| `no_masalah`      | `string` | **Required**. no_masalah of item to fetch |

- Body
```
{
  "penanganan": String,
  "detail": [
    "kode_sparepart": String,
    "jumlah": Number,
    "keterangan": String
  ]
}
```
Note: *detail is optional
```

```
- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil menambahkan data"
  ],
  data: {
      "no_masalah": String,
      "nama_kategori": String,
      "tgl_masalah": String,
      "kode_mesin": String,
      "penyebab": String,
      "keterangan_masalah": String,
      "penanganan": String,
      "tgl_penanganan": String,
      "total_biaya": Number,
      "created_by": String,
      "user_penanganan": String,
      "created_date": String,
      "deleted_by": String,
      "deleted_date": String,
      "status": String,
      "nama_mesin": String,
    }
}
```
#### Delete Penanganan
- Header
```
  DELETE /api/masalah_detail/${no_masalah}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`   | `string` | **Required**. Your API key |
| `no_masalah`      | `string` | **Required**. no_masalah of item to fetch |

- Response
```
{
  "status": "success",
  "code": 201,
  "message": [
    "Berhasil membatalkan penanganan"
  ],
}
```
### Log Mesin
#### Get All Data
- Header
```
  GET /api/log_mesin
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `page`    | `number` | default: 1 |
| `limit`   | `number` | default: 10 |

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "tanggal": String,
      "kode_mesin": String,
      "kategori": String,
      "keterangan": String,
      "user_input": String,
      "nama_mesin": String
    }
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Get data
- Header
```
  GET /api/log_mesin/${id}
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. Your API key        |
| `id`      | `string` | **Required**. Id of item to fetch |
- Response
```
{
  "status": "success",
  "code": 200,
  "data": {
      "tanggal": String,
      "kode_mesin": String,
      "kategori": String,
      "keterangan": String,
      "user_input": String,
      "nama_mesin": String
    },
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Search data
- Header
```
  GET /api/log_mesin/search
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `search`  | `string` | **Required**. search to fetch data|

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "tanggal": String,
      "kode_mesin": String,
      "kategori": String,
      "keterangan": String,
      "user_input": String,
      "nama_mesin": String
    }
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
### Log Sparepart
#### Get All Data
- Header
```
  GET /api/log_sparepart
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `page`    | `number` | default: 1 |
| `limit`   | `number` | default: 10 |

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "tanggal": String,
      "kode_sparepart": String,
      "kategori": String,
      "keterangan": String,
      "stok_awal": Number,
      "stok_masuk": Number,
      "stok_keluar": Number,
      "stok_akhir": Number
    }
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Get data
- Header
```
  GET /api/log_sparepart/${id}
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. Your API key        |
| `id`      | `string` | **Required**. Id of item to fetch |
- Response
```
{
  "status": "success",
  "code": 200,
  "data": {
      "tanggal": String,
      "kode_sparepart": String,
      "kategori": String,
      "keterangan": String,
      "stok_awal": Number,
      "stok_masuk": Number,
      "stok_keluar": Number,
      "stok_akhir": Number
    },
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Search data
- Header
```
  GET /api/log_sparepart/search
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `search`  | `string` | **Required**. search to fetch data|

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "tanggal": String,
      "kode_sparepart": String,
      "kategori": String,
      "keterangan": String,
      "stok_awal": Number,
      "stok_masuk": Number,
      "stok_keluar": Number,
      "stok_akhir": Number
    }
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
### Log user
#### Get All Data
- Header
```
  GET /api/log_user
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `page`    | `number` | default: 1 |
| `limit`   | `number` | default: 10 |

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
     {
      "tanggal": String,
      "kode_user": String,
      "kategori": String,
      "keterangan": String
    },
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Get data
- Header
```
  GET /api/log_user/${id}
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. Your API key        |
| `id`      | `string` | **Required**. Id of item to fetch |
- Response
```
{
  "status": "success",
  "code": 200,
  "data": {
      "tanggal": String,
      "kode_user": String,
      "kategori": String,
      "keterangan": String
    },
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```
#### Search data
- Header
```
  GET /api/log_user/search
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**. Your API key |
| `search`  | `string` | **Required**. search to fetch data|

- Response
```
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "tanggal": String,
      "kode_user": String,
      "kategori": String,
      "keterangan": String
    }
  ],
  "pagination": {
    "currentPage": Number,
    "itemsPerPage": Number,
    "totalItems": Number,
    "totalPages": Number
  }
}
```