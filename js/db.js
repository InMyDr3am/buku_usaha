/**
 * db.js
 * Lapisan penyimpanan (localStorage) dan helper murni yang dipakai di seluruh modul.
 * Tidak ada modul lain yang boleh mengakses localStorage secara langsung —
 * semua akses data harus lewat objek DB di file ini.
 */

const DB = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      return [];
    }
  },
  set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }
};

const KEYS = {
  beli: 'buku_usaha_pembelian',
  jual: 'buku_usaha_penjualan',
  produksi: 'buku_usaha_produksi',
  produk: 'buku_usaha_produk'
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function rupiah(n) {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

/**
 * Render generik untuk tabel riwayat (Pembelian, Penjualan, Produksi, Produk).
 * @param {string} key - key di KEYS untuk data yang mau ditampilkan
 * @param {string} tbodyId - id elemen <tbody> tujuan
 * @param {string} emptyId - id elemen placeholder "belum ada data"
 * @param {function(item): string} rowRenderer - fungsi yang mengembalikan innerHTML <tr>
 */
function renderTable(key, tbodyId, emptyId, rowRenderer) {
  const data = DB.get(key).slice().sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const tbody = document.getElementById(tbodyId);
  const empty = document.getElementById(emptyId);
  tbody.innerHTML = '';

  if (data.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  data.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = rowRenderer(item);
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const updated = DB.get(key).filter(x => x.id !== id);
      DB.set(key, updated);
      refreshAll();
    });
  });
}
