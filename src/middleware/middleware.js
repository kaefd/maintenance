const jwt = require('jsonwebtoken');
const config = require('./config');
const UserModel = require('../models/userModel');
const RoleModel = require('../models/RoleModel');
const PermissionModel = require('../models/permissionModel');

const authenticateToken = (req, res, next) => {
  // GET TOKEN
  const authHeader = req.headers['authorization']
  let token = authHeader.split(' ')[1]

  if(!token) return res.sendStatus(401)
  jwt.verify(token, config.secret, (err, payload) => {

    if (err) return res.sendStatus(403)
    // SET SESSION
    req.session.user = payload.username
    next()
    
  })
}

const authUser = (method, table) => {
  return async (req, res, next) => {
    const role = await UserModel.findByPk(req.session.user)
    const isAllow = await PermissionModel.findOne({
      where: {
        method: method,
        table: table,
        role_id: role.role_id
      }
    })
    if(!isAllow) return res.sendStatus(403)
    next()
  }
}

module.exports = {
    authenticateToken,
    authUser
}