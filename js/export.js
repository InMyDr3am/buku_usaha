/**
 * export.js
 * Modul Export: unduh data ke Excel (.xlsx) per modul, atau semua sekaligus
 * dalam satu file multi-sheet. Pakai SheetJS (dimuat via CDN).
 */

function downloadExcel(rows, filename, sheetName) {
  if (!rows || rows.length === 0) {
    alert('Belum ada data untuk diunduh di bagian ini.');
    return;
  }
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, (sheetName || 'Data').slice(0, 31));
  XLSX.writeFile(wb, filename);
}

// ---------- Baris data per modul, siap diekspor (nama kolom dalam Bahasa Indonesia) ----------

function rowsProduk() {
  return DB.get(KEYS.produk).slice().sort((a, b) => a.nama.localeCompare(b.nama)).map(p => ({
    'Nama Produk': p.nama,
    'Harga Jual Default': p.harga || 0,
    'Satuan': p.satuan || ''
  }));
}

function rowsPembelian() {
  return DB.get(KEYS.beli).slice().sort((a, b) => a.tanggal.localeCompare(b.tanggal)).map(x => ({
    'Tanggal': x.tanggal,
    'Bahan': x.bahan,
    'Jumlah': x.jumlah,
    'Satuan': x.satuan,
    'Harga per Satuan': x.harga,
    'Total': x.total,
    'Supplier': x.supplier || ''
  }));
}

function rowsStok() {
  const stok = computeStok();
  return Object.values(stok).sort((a, b) => a.nama.localeCompare(b.nama)).map(s => ({
    'Nama Bahan': s.nama,
    'Satuan': s.satuan || '',
    'Total Masuk (Beli)': s.masuk,
    'Total Keluar (Produksi)': s.keluar,
    'Stok Saat Ini': s.stok
  }));
}

function rowsPenjualan() {
  return DB.get(KEYS.jual).slice().sort((a, b) => a.tanggal.localeCompare(b.tanggal)).map(x => ({
    'Tanggal': x.tanggal,
    'Produk': x.produk,
    'Jumlah': x.jumlah,
    'Harga per Satuan': x.harga,
    'Total': x.total,
    'Pelanggan': x.pelanggan || ''
  }));
}

function rowsProduksi() {
  return DB.get(KEYS.produksi).slice().sort((a, b) => a.tanggal.localeCompare(b.tanggal)).map(x => ({
    'Tanggal': x.tanggal,
    'Produk': x.produk,
    'Jumlah Diproduksi': x.jumlah,
    'Bahan Dipakai': (x.bahanDipakai || []).map(b => `${b.bahan} (${b.jumlah})`).join(', '),
    'Catatan': x.catatan || ''
  }));
}

// ---------- Tombol per modul ----------

document.getElementById('dlProduk').addEventListener('click',
  () => downloadExcel(rowsProduk(), 'daftar-produk.xlsx', 'Produk'));

document.getElementById('dlPembelian').addEventListener('click',
  () => downloadExcel(rowsPembelian(), 'riwayat-pembelian.xlsx', 'Pembelian'));

document.getElementById('dlStok').addEventListener('click',
  () => downloadExcel(rowsStok(), 'stok-bahan.xlsx', 'Stok Bahan'));

document.getElementById('dlPenjualan').addEventListener('click',
  () => downloadExcel(rowsPenjualan(), 'riwayat-penjualan.xlsx', 'Penjualan'));

document.getElementById('dlProduksi').addEventListener('click',
  () => downloadExcel(rowsProduksi(), 'riwayat-produksi.xlsx', 'Produksi'));

// ---------- Tombol unduh semua (satu file, multi-sheet) ----------

document.getElementById('dlSemua').addEventListener('click', () => {
  const sheets = [
    { name: 'Produk', rows: rowsProduk() },
    { name: 'Pembelian', rows: rowsPembelian() },
    { name: 'Stok Bahan', rows: rowsStok() },
    { name: 'Penjualan', rows: rowsPenjualan() },
    { name: 'Produksi', rows: rowsProduksi() }
  ];

  const adaData = sheets.some(s => s.rows.length > 0);
  if (!adaData) {
    alert('Belum ada data sama sekali untuk diunduh.');
    return;
  }

  const wb = XLSX.utils.book_new();
  sheets.forEach(s => {
    const rows = s.rows.length ? s.rows : [{ 'Keterangan': 'Belum ada data' }];
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31));
  });

  const bizName = (localStorage.getItem('buku_usaha_nama') || 'usaha')
    .trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  XLSX.writeFile(wb, `data-${bizName || 'usaha'}-${todayISO()}.xlsx`);
});
