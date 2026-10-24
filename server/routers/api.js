'use strict';

const express = require('express');
const ApiController = require('../controllers/ApiController');
const { apiLogin, apiSeller, apiBuyer } = require('../middlewares/auth');
const { unggahGambarProdukApi } = require('../middlewares/upload');

const router = express.Router();
const handle = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/auth/register', handle(ApiController.register));
router.post('/auth/login', handle(ApiController.login));
router.post('/auth/logout', apiLogin, handle(ApiController.logout));
router.get('/auth/me', apiLogin, handle(ApiController.me));

router.get('/categories', handle(ApiController.categories));
router.get('/home', handle(ApiController.home));
router.get('/products', handle(ApiController.products));
router.get('/products/:id', handle(ApiController.product));
router.post('/products', apiLogin, apiSeller, unggahGambarProdukApi, handle(ApiController.createProduct));
router.patch('/products/:id', apiLogin, apiSeller, unggahGambarProdukApi, handle(ApiController.updateProduct));
router.delete('/products/:id', apiLogin, apiSeller, handle(ApiController.deleteProduct));

router.get('/profile', apiLogin, handle(ApiController.profile));
router.patch('/profile/budget', apiLogin, handle(ApiController.budget));

router.get('/cart', apiLogin, apiBuyer, handle(ApiController.cart));
router.post('/cart/items', apiLogin, apiBuyer, handle(ApiController.addCartItem));
router.patch('/cart/items/:id', apiLogin, apiBuyer, handle(ApiController.updateCartItem));
router.delete('/cart/items/:id', apiLogin, apiBuyer, handle(ApiController.deleteCartItem));

router.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  return res.status(500).json({ error: { message: 'Terjadi kesalahan pada server' } });
});

module.exports = router;
