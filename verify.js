'use strict';

const ejs = require('ejs');
const path = require('path');
const db = require('./models');
const { formatRupiah } = require('./helpers/formatHelper');

const { User, Profile, Category, Product, Cart } = db;
let gagal = 0;

function cek(nama, fn) {
  try {
    fn();
    console.log('  OK   ' + nama);
  } catch (error) {
    gagal++;
    console.log('  GAGAL ' + nama + ' -> ' + error.message);
  }
}

console.log('\n== Model & asosiasi ==');
cek('semua model termuat', () => {
  ['User', 'Profile', 'Category', 'Product', 'Cart'].forEach(n => {
    if (!db[n]) throw new Error('model ' + n + ' tidak ada');
  });
});
cek('User: hasOne Profile, hasMany Cart, belongsToMany Product', () => {
  const a = User.associations;
  if (!a.Profile || a.Profile.associationType !== 'HasOne') throw new Error('hasOne Profile hilang');
  if (a.Products) throw new Error('Users seharusnya tidak lagi hasMany Product');
  if (!a.CartProducts || a.CartProducts.associationType !== 'BelongsToMany') throw new Error('belongsToMany tidak terdaftar');
  if (!a.Carts || a.Carts.associationType !== 'HasMany') throw new Error('hasMany Cart tidak terdaftar');
});
cek('Product: belongsTo Category, belongsToMany User, tanpa UserId', () => {
  const a = Product.associations;
  if (!a.Category) throw new Error('belongsTo Category hilang');
  if (a.User) throw new Error('Products seharusnya tidak lagi punya FK UserId');
  if (!a.Buyers || a.Buyers.associationType !== 'BelongsToMany') throw new Error('belongsToMany tidak terdaftar');
});
cek('static method tersedia', () => {
  if (typeof Product.findByFilter !== 'function') throw new Error('Product.findByFilter hilang');
  if (typeof Product.findTerjangkau !== 'function') throw new Error('Product.findTerjangkau hilang');
  if (typeof Category.findAllWithProductCount !== 'function') throw new Error('Category.findAllWithProductCount hilang');
  if (typeof User.findWithProfile !== 'function') throw new Error('User.findWithProfile hilang');
  if (typeof Cart.findByUser !== 'function') throw new Error('Cart.findByUser hilang');
});

console.log('\n== Getter & instance method ==');
const kategori = Category.build({ id: 2, name: 'Batik & Tenun' });
const produk = Product.build({
  id: 1, name: 'Batik Tulis Pekalongan',
  description: 'Kain batik tulis motif jlamprang dengan pewarna alami, panjang dua meter.',
  price: 450000, imageUrl: '/assets/uploads/produk-1.jpg', CategoryId: 2
});
produk.Category = kategori;

cek('Product getter hargaRupiah', () => {
  if (produk.hargaRupiah !== 'Rp 450.000') throw new Error('hasil: ' + produk.hargaRupiah);
});
cek('Product getter deskripsiSingkat memotong teks', () => {
  const panjang = Product.build({ description: 'Kain batik tulis motif jlamprang dengan pewarna alami dari kulit kayu tingi dan jambal, ditulis tangan selama tiga minggu penuh.' });
  if (!panjang.deskripsiSingkat.endsWith('...')) throw new Error('teks panjang tidak terpotong');
  if (panjang.deskripsiSingkat.length > 95) throw new Error('potongan terlalu panjang');
  const pendek = Product.build({ description: 'Deskripsi pendek.' });
  if (pendek.deskripsiSingkat.endsWith('...')) throw new Error('teks pendek seharusnya utuh');
});
cek('User getter labelPeran', () => {
  const penjual = User.build({ role: 'seller' });
  const pembeli = User.build({ role: 'buyer' });
  if (penjual.labelPeran !== 'Penjual' || pembeli.labelPeran !== 'Pembeli') throw new Error('label salah');
});

const baris = Cart.build({ id: 1, UserId: 2, ProductId: 1, quantity: 3 });
baris.Product = produk;
cek('Cart.hitungSubtotal', () => {
  if (baris.hitungSubtotal() !== 1350000) throw new Error('hasil: ' + baris.hitungSubtotal());
});
cek('Cart getter subtotalRupiah', () => {
  if (baris.subtotalRupiah !== 'Rp 1.350.000') throw new Error('hasil: ' + baris.subtotalRupiah);
});

const profil = Profile.build({
  UserId: 2, fullName: 'Arief Rizky', phoneNumber: '081298765432',
  address: 'Jl. Sudirman 45', budgetLimit: 500000
});
cek('Profile.isWithinBudget menolak belanja berlebih', () => {
  if (profil.isWithinBudget(1350000) !== false) throw new Error('seharusnya false');
  if (profil.isWithinBudget(400000) !== true) throw new Error('seharusnya true');
});
cek('Profile.sisaBudget', () => {
  if (profil.sisaBudget(400000) !== 100000) throw new Error('hasil: ' + profil.sisaBudget(400000));
});

console.log('\n== Validasi ==');
async function ujiValidasi(nama, model, data, potongan) {
  try {
    await model.build(data).validate();
    gagal++;
    console.log('  GAGAL ' + nama + ' -> validasi tidak menyala');
  } catch (error) {
    const pesan = error.errors ? error.errors.map(e => e.message).join(' | ') : error.message;
    if (pesan.includes(potongan)) {
      console.log('  OK   ' + nama + ' -> "' + pesan.split(' | ')[0] + '"');
    } else {
      gagal++;
      console.log('  GAGAL ' + nama + ' -> pesan tak terduga: ' + pesan);
    }
  }
}

console.log('\n== Render EJS ==');
const sesiPembeli = { userId: 2, username: 'ariefrizky', role: 'buyer' };
const sesiPenjual = { userId: 1, username: 'tokobatikarum', role: 'seller' };
const penggunaLengkap = User.build({ id: 1, username: 'tokobatikarum', email: 'a@mail.com', role: 'seller' });
penggunaLengkap.Profile = profil;

const kategoriHitung = Category.build({ id: 2, name: 'Batik & Tenun' });
kategoriHitung.Products = [{ id: 1 }, { id: 2 }];

const halaman = [
  ['home.ejs', { judul: 'Beranda', session: sesiPembeli, daftarKategori: [kategoriHitung], produkTerjangkau: [produk], jumlahProduk: 8 }],
  ['register.ejs', { judul: 'Daftar', session: {}, error: 'Format email tidak valid' }],
  ['login.ejs', { judul: 'Masuk', session: {}, error: null, notification: 'Pendaftaran berhasil' }],
  ['products.ejs', { judul: 'Katalog', session: sesiPembeli, daftarProduk: [produk], daftarKategori: [kategori], keyword: 'batik', categoryId: '2', sort: 'termurah', error: null, notification: null }],
  ['products.ejs (kosong)', { judul: 'Katalog', session: sesiPenjual, daftarProduk: [], daftarKategori: [kategori], keyword: '', categoryId: '', sort: 'terbaru', error: 'Produk tidak ditemukan', notification: null }],
  ['productDetail.ejs', { judul: 'Detail', session: sesiPembeli, produk }],
  ['productForm.ejs (tambah)', { judul: 'Tambah', session: sesiPenjual, produk: null, daftarKategori: [kategori], error: null }],
  ['productForm.ejs (ubah)', { judul: 'Ubah', session: sesiPenjual, produk, daftarKategori: [kategori], error: 'Harga produk minimal Rp 1.000' }],
  ['cart.ejs', { judul: 'Keranjang', session: sesiPembeli, daftarKeranjang: [baris], profil, totalBelanja: 1350000, melebihiBudget: true, sisaBudget: -850000, formatRupiah, error: null, notification: null }],
  ['cart.ejs (kosong)', { judul: 'Keranjang', session: sesiPembeli, daftarKeranjang: [], profil, totalBelanja: 0, melebihiBudget: false, sisaBudget: 500000, formatRupiah, error: null, notification: 'Barang dihapus' }],
  ['profile.ejs', { judul: 'Profil', session: sesiPenjual, pengguna: penggunaLengkap, daftarProduk: [produk], error: null, notification: null }],
  ['profile.ejs (pembeli)', { judul: 'Profil', session: sesiPembeli, pengguna: penggunaLengkap, daftarProduk: [], error: null, notification: null }],
  ['notFound.ejs', { judul: '404', session: {} }]
];

(async () => {
  await ujiValidasi('User email kosong', User, { email: '', password: 'rahasia123', role: 'buyer' }, 'Email tidak boleh kosong');
  await ujiValidasi('User email salah format', User, { email: 'bukanemail', password: 'rahasia123', role: 'buyer' }, 'Format email tidak valid');
  await ujiValidasi('User password terlalu pendek', User, { email: 'a@mail.com', password: 'abc', role: 'buyer' }, 'Password minimal 8 karakter');
  await ujiValidasi('User role di luar daftar', User, { email: 'a@mail.com', password: 'rahasia123', role: 'admin' }, 'Peran hanya boleh buyer atau seller');
  await ujiValidasi('Product harga di bawah minimum', Product, { name: 'Tes produk', description: 'Deskripsi cukup panjang', price: 500, CategoryId: 1 }, 'Harga produk minimal');
  await ujiValidasi('Product nama kosong', Product, { name: '', description: 'Deskripsi cukup panjang', price: 5000, CategoryId: 1 }, 'Nama produk tidak boleh kosong');
  await ujiValidasi('Profile nomor telepon salah pola', Profile, { UserId: 1, fullName: 'Arief', phoneNumber: '12345', address: 'Jl. Test' }, 'Nomor telepon harus diawali 08');
  await ujiValidasi('Cart jumlah nol', Cart, { UserId: 1, ProductId: 1, quantity: 0 }, 'Jumlah barang minimal 1');

  console.log('');
  for (const [nama, data] of halaman) {
    const berkas = nama.split(' ')[0];
    try {
      const hasil = await ejs.renderFile(path.join(__dirname, 'views', berkas), data);
      if (!hasil.includes('</html>')) throw new Error('HTML tidak lengkap');
      console.log('  OK   ' + nama + ' (' + hasil.length + ' karakter)');
    } catch (error) {
      gagal++;
      console.log('  GAGAL ' + nama + ' -> ' + error.message.split('\n')[0]);
    }
  }

  console.log('\n== Router ==');
  cek('routers/index.js termuat dan mendaftarkan rute', () => {
    const router = require('./routers');
    const rute = router.stack.filter(l => l.route).map(l => {
      return Object.keys(l.route.methods)[0].toUpperCase() + ' ' + l.route.path;
    });
    const wajib = ['GET /', 'GET /login', 'POST /login', 'GET /logout', 'GET /register', 'POST /register', 'GET /products', 'GET /carts'];
    wajib.forEach(r => {
      if (!rute.includes(r)) throw new Error('rute hilang: ' + r);
    });
    console.log('       total rute terdaftar: ' + rute.length);
  });

  console.log('\n' + (gagal === 0 ? 'SEMUA PENGUJIAN LULUS' : gagal + ' PENGUJIAN GAGAL'));
  process.exit(gagal === 0 ? 0 : 1);
})();
