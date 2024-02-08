// src/app.js

const express = require('express');
const session = require('express-session');
const app = express();
const sequelize = require('./connect');
const routes = require('./src/routes/routes');
const config = require('./src/middleware/config');

sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synchronized');
  })
  .catch((error) => {
    console.error('Error synchronizing database:', error);
  });

app.use(express.json());
app.use(session({
  secret: config.secret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json')
  next()
})

app.use('/api', routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});