/**
 * app.js
 * Titik masuk aplikasi: navigasi antar modul, nama usaha, dan orkestrasi
 * render ulang semua modul lewat refreshAll(). File ini dimuat PALING
 * TERAKHIR karena bergantung pada fungsi dari semua modul lain.
 */

// ---------- Navigasi ----------
document.getElementById('nav').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-target]');
  if (!btn) return;

  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('main section').forEach(s => s.classList.remove('active'));

  btn.classList.add('active');
  document.getElementById(btn.dataset.target).classList.add('active');

  // grafik hanya digambar saat tab Laporan aktif (canvas butuh terlihat dulu)
  if (btn.dataset.target === 'laporan') renderCharts();
});

// ---------- Nama usaha (persisten) ----------
const bizInput = document.getElementById('bizName');
bizInput.value = localStorage.getItem('buku_usaha_nama') || 'Usaha Saya';
bizInput.addEventListener('input', () => localStorage.setItem('buku_usaha_nama', bizInput.value));

// ---------- Label tanggal hari ini ----------
document.getElementById('todayLabel').textContent = new Date().toLocaleDateString('id-ID', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// ---------- Default tanggal hari ini di semua input tanggal ----------
document.querySelectorAll('input[type=date]').forEach(inp => inp.value = todayISO());

// ---------- Orkestrasi render ulang seluruh modul ----------
// Dipanggil setiap kali ada perubahan data (tambah/hapus entri) dari modul manapun.
function refreshAll() {
  renderProdukList();
  renderProdukDatalist();
  renderPembelian();
  renderPenjualan();
  renderProduksi();
  renderStok();
  renderRingkasan();
}

refreshAll();
