/**
 * ringkasan.js
 * Modul Ringkasan: kartu statistik dashboard + daftar aktivitas terbaru
 * gabungan dari Pembelian, Penjualan, dan Produksi.
 */

function renderRingkasan() {
  const beli = DB.get(KEYS.beli);
  const jual = DB.get(KEYS.jual);
  const produksi = DB.get(KEYS.produksi);

  const totalJual = jual.reduce((s, x) => s + x.total, 0);
  const totalBeli = beli.reduce((s, x) => s + x.total, 0);
  const totalProduksi = produksi.reduce((s, x) => s + x.jumlah, 0);

  document.getElementById('statPenjualan').textContent = rupiah(totalJual);
  document.getElementById('statPembelian').textContent = rupiah(totalBeli);
  document.getElementById('statLaba').textContent = rupiah(totalJual - totalBeli);
  document.getElementById('statProduksi').textContent = totalProduksi.toLocaleString('id-ID');

  const activity = [
    ...beli.map(x => ({ tanggal: x.tanggal, jenis: 'Pembelian', ket: x.bahan, nilai: x.total })),
    ...jual.map(x => ({ tanggal: x.tanggal, jenis: 'Penjualan', ket: x.produk, nilai: x.total })),
    ...produksi.map(x => ({ tanggal: x.tanggal, jenis: 'Produksi', ket: `${x.produk} (${x.jumlah} unit)`, nilai: null })),
  ].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 10);

  const tbody = document.getElementById('recentBody');
  tbody.innerHTML = '';

  if (activity.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty">Belum ada aktivitas tercatat.</td></tr>';
    return;
  }

  activity.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${a.tanggal}</td>
      <td>${a.jenis}</td>
      <td>${escapeHtml(a.ket)}</td>
      <td class="num">${a.nilai === null ? '—' : rupiah(a.nilai)}</td>
    `;
    tbody.appendChild(tr);
  });
}
