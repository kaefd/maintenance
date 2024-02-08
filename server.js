// src/app.js

const express = require('express');
const session = require('express-session');
const app = express();
const sequelize = require('./connect'); // Pastikan untuk mengonfigurasi koneksi database di sini
const routes = require('./src/routes/routes');
const config = require('./src/middleware/config');

// Sinkronkan model dengan database
sequelize.sync({ force: false }) // Sesuaikan parameter force sesuai kebutuhan Anda
  .then(() => {
    console.log('Database synchronized');
  })
  .catch((error) => {
    console.error('Error synchronizing database:', error);
  });

// Middleware untuk parsing JSON
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

// Menggunakan rute-rute
app.use('/api', routes);

// Port untuk server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});