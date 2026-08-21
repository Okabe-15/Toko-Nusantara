'use strict';

//>>> Mengubah angka menjadi format mata uang rupiah
function formatRupiah(angka) {
  if (angka === null || angka === undefined) return 'Rp 0';
  return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

//>>> Memotong teks panjang lalu menambahkan elipsis
function potongTeks(teks, batas) {
  if (!teks) return '';
  if (teks.length <= batas) return teks;
  return teks.slice(0, batas).trim() + '...';
}

//>>> Mengubah tanggal menjadi format Indonesia tanpa toISOString
function formatTanggal(tanggal) {
  if (!tanggal) return '-';
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

//>>> Menghitung total belanja dari daftar baris keranjang
function hitungTotalBelanja(daftarKeranjang) {
  return daftarKeranjang
    .map(baris => baris.hitungSubtotal())
    .reduce((total, subtotal) => total + subtotal, 0);
}

module.exports = { formatRupiah, potongTeks, formatTanggal, hitungTotalBelanja };
