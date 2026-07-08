/**
 * produk.js
 * Modul "Kelola Produk": katalog produk yang dipakai sebagai sumber
 * autocomplete di modul Penjualan & Produksi.
 */

function findProduk(nama) {
  const key = (nama || '').trim().toLowerCase();
  if (!key) return null;
  return DB.get(KEYS.produk).find(p => p.nama.trim().toLowerCase() === key) || null;
}

/**
 * Daftarkan produk baru ke katalog jika belum ada.
 * Dipanggil otomatis dari modul Penjualan & Produksi saat user mengetik nama produk baru.
 */
function ensureProdukTerdaftar(nama, hargaDefault) {
  const trimmed = (nama || '').trim();
  if (!trimmed) return;
  if (findProduk(trimmed)) return;

  const data = DB.get(KEYS.produk);
  data.push({ id: uid(), nama: trimmed, harga: hargaDefault || 0, satuan: '' });
  DB.set(KEYS.produk, data);
}

function renderProdukList() {
  renderTable(KEYS.produk, 'produkBody', 'produkEmpty', item => `
    <td>${escapeHtml(item.nama)}</td>
    <td class="num">${item.harga ? rupiah(item.harga) : '—'}</td>
    <td>${escapeHtml(item.satuan || '—')}</td>
    <td><button class="del-btn" data-id="${item.id}">Hapus</button></td>
  `);
}

function renderProdukDatalist() {
  const produkList = DB.get(KEYS.produk).slice().sort((a, b) => a.nama.localeCompare(b.nama));
  document.getElementById('produkDatalist').innerHTML =
    produkList.map(p => `<option value="${escapeHtml(p.nama)}">`).join('');
}

document.getElementById('formProduk').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  const nama = f.nama.value.trim();
  if (!nama) return;

  if (findProduk(nama)) {
    alert('Produk dengan nama ini sudah terdaftar.');
    return;
  }

  const item = {
    id: uid(),
    nama,
    harga: parseFloat(f.harga.value) || 0,
    satuan: f.satuan.value.trim()
  };
  const data = DB.get(KEYS.produk);
  data.push(item);
  DB.set(KEYS.produk, data);

  f.reset();
  refreshAll();
});
