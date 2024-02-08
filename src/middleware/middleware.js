const jwt = require('jsonwebtoken');
const config = require('./config');

function authenticateToken(req, res, next) {
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

module.exports = {
    authenticateToken
}