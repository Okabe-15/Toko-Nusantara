'use strict';

const bcrypt = require('bcryptjs');

//>>> Mengenkripsi password sebelum disimpan ke database
function hashPassword(passwordAsli) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(passwordAsli, salt);
}

//>>> Membandingkan password input dengan password terenkripsi
function comparePassword(passwordAsli, passwordTersimpan) {
  return bcrypt.compareSync(passwordAsli, passwordTersimpan);
}

module.exports = { hashPassword, comparePassword };
