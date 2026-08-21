'use strict';

const multer = require('multer');
const fs = require('fs');

const folderTujuan = 'assets/uploads';
const jenisDiizinkan = ['image/jpeg', 'image/png', 'image/webp'];
const batasUkuran = 2 * 1024 * 1024;

if (!fs.existsSync(folderTujuan)) {
  fs.mkdirSync(folderTujuan, { recursive: true });
}

//>>> Menentukan lokasi dan nama berkas hasil unggahan
const penyimpanan = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, folderTujuan);
  },
  filename: (req, file, callback) => {
    const potonganNama = file.originalname.split('.');
    const ekstensi = potonganNama[potonganNama.length - 1].toLowerCase();
    callback(null, `produk-${Date.now()}.${ekstensi}`);
  }
});

//>>> Menolak berkas yang bukan gambar sebelum tersimpan ke disk
const saringBerkas = (req, file, callback) => {
  if (!jenisDiizinkan.includes(file.mimetype)) {
    return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'));
  }
  callback(null, true);
};

const unggah = multer({
  storage: penyimpanan,
  fileFilter: saringBerkas,
  limits: { fileSize: batasUkuran }
});

//>>> Menerjemahkan error multer menjadi pesan berbahasa Indonesia
function unggahGambarProduk(req, res, next) {
  unggah.single('image')(req, res, (error) => {
    if (!error) return next();

    const daftarPesan = {
      LIMIT_FILE_SIZE: 'Ukuran gambar maksimal 2 MB',
      LIMIT_UNEXPECTED_FILE: 'Gambar harus berformat JPG, PNG, atau WEBP'
    };
    const pesan = daftarPesan[error.code] || 'Gambar gagal diunggah, silakan coba lagi';
    const tujuan = req.params.id ? `/products/${req.params.id}/edit` : '/products/add';

    res.redirect(`${tujuan}?error=${encodeURIComponent(pesan)}`);
  });
}

//>>> Menghapus berkas yang terlanjur terunggah ketika validasi model gagal
function hapusBerkasTerunggah(berkas) {
  if (!berkas) return;
  if (fs.existsSync(berkas.path)) {
    fs.unlinkSync(berkas.path);
  }
}

module.exports = { unggahGambarProduk, hapusBerkasTerunggah };
