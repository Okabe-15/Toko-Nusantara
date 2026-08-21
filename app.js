'use strict';

const express = require('express');
const session = require('express-session');
const router = require('./routers');

const app = express();
const port = 3002;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static('assets'));

app.use(session({
  secret: 'toko-nusantara-pair-project',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }
}));

app.use(router);

app.use((req, res) => {
  res.status(404).render('notFound', { session: req.session });
});

app.listen(port, () => {
  console.log(`Toko Nusantara berjalan di http://localhost:${port}`);
});
