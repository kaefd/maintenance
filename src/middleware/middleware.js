const jwt = require('jsonwebtoken');
const config = require('./config');
const UserModel = require('../models/userModel');
const RoleModel = require('../models/RoleModel');

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

const authUser = (user) => {
  return async (req, res, next) => {
    const role = await UserModel.findByPk(req.session.user)
    const nameRole = await RoleModel.findByPk(role.role_id)
    console.log(nameRole);
    if(!user.includes((nameRole.nama_role).toLowerCase())) return res.sendStatus(403)
    next()
  }
}

module.exports = {
    authenticateToken,
    authUser
}