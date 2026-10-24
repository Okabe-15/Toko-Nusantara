'use strict';

const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');
const ProductController = require('../controllers/ProductController');
const CartController = require('../controllers/CartController');
const { wajibLogin, wajibPenjual, wajibPembeli } = require('../middlewares/auth');
const { unggahGambarProduk } = require('../middlewares/upload');

// ---- Halm publik ----
router.get('/', UserController.landingPage);

router.get('/register', UserController.formRegister);
router.post('/register', UserController.prosesRegister);

router.get('/login', UserController.formLogin);
router.post('/login', UserController.prosesLogin);

router.get('/logout', UserController.logout);

// ---- Clg produk, wajib login ----
router.get('/products', wajibLogin, ProductController.daftarProduk);

router.get('/products/add', wajibLogin, wajibPenjual, ProductController.formTambah);
router.post('/products/add', wajibLogin, wajibPenjual, unggahGambarProduk, ProductController.prosesTambah);

router.get('/products/:id', wajibLogin, ProductController.detailProduk);

router.get('/products/:id/edit', wajibLogin, wajibPenjual, ProductController.formEdit);
router.post('/products/:id/edit', wajibLogin, wajibPenjual, unggahGambarProduk, ProductController.prosesEdit);
router.get('/products/:id/delete', wajibLogin, wajibPenjual, ProductController.hapusProduk);

// ---- Keranjang, khusus pembeli ----
router.get('/carts', wajibLogin, wajibPembeli, CartController.halamanKeranjang);
router.post('/carts/add', wajibLogin, wajibPembeli, CartController.tambahKeKeranjang);
router.post('/carts/:id/edit', wajibLogin, wajibPembeli, CartController.ubahJumlah);
router.get('/carts/:id/delete', wajibLogin, wajibPembeli, CartController.hapusDariKeranjang);

// ---- Profil ----
router.get('/profile', wajibLogin, UserController.halamanProfil);
router.post('/profile/budget', wajibLogin, UserController.ubahBudget);

module.exports = router;
