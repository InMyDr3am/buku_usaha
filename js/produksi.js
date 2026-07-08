/**
 * produksi.js
 * Modul Produksi: mencatat hasil produksi beserta bahan baku yang dipakai
 * (multi-baris). Bahan yang dipakai otomatis mengurangi stok (lihat stok.js).
 */

const produksiRowsBody = document.getElementById('produksiRows');

function makeProduksiRow() {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" class="row-bahan" list="bahanDatalist" placeholder="cth. Tepung terigu"></td>
    <td><input type="number" step="any" min="0" class="row-jumlah" placeholder="0"></td>
    <td><button type="button" class="del-btn row-remove">Hapus</button></td>
  `;
  tr.querySelector('.row-remove').addEventListener('click', () => {
    if (produksiRowsBody.children.length > 1) tr.remove();
  });
  return tr;
}

function resetProduksiRows(jumlahBaris) {
  produksiRowsBody.innerHTML = '';
  for (let i = 0; i < jumlahBaris; i++) produksiRowsBody.appendChild(makeProduksiRow());
}

document.getElementById('addProduksiRow').addEventListener('click', () => {
  produksiRowsBody.appendChild(makeProduksiRow());
});

resetProduksiRows(2);

document.getElementById('formProduksi').addEventListener('submit', e => {
  e.preventDefault();
  const tanggal = document.getElementById('produksiTanggal').value;
  const produk = document.getElementById('produksiProduk').value.trim();
  const jumlah = parseFloat(document.getElementById('produksiJumlah').value) || 0;
  const catatan = document.getElementById('produksiCatatan').value;

  const rows = Array.from(document.querySelectorAll('#produksiRows tr'));
  const bahanDipakai = [];
  rows.forEach(row => {
    const bahan = row.querySelector('.row-bahan').value.trim();
    const jml = parseFloat(row.querySelector('.row-jumlah').value) || 0;
    if (!bahan || !jml) return;
    bahanDipakai.push({ bahan, jumlah: jml });
  });

  // cek kecukupan stok, beri peringatan tapi tidak memblokir penyimpanan
  const stok = computeStok();
  const kurang = bahanDipakai.filter(b => {
    const s = stok[b.bahan.toLowerCase()];
    const tersedia = s ? s.stok : 0;
    return b.jumlah > tersedia;
  });
  if (kurang.length > 0) {
    const pesan = kurang
      .map(b => `- ${b.bahan} (dipakai ${b.jumlah}, stok tersedia ${(stok[b.bahan.toLowerCase()]?.stok || 0)})`)
      .join('\n');
    const lanjut = confirm(`Stok bahan berikut tidak cukup:\n${pesan}\n\nTetap simpan produksi ini? (Stok akan menjadi minus)`);
    if (!lanjut) return;
  }

  const item = { id: uid(), tanggal, produk, jumlah, bahanDipakai, catatan };
  const data = DB.get(KEYS.produksi);
  data.push(item);
  DB.set(KEYS.produksi, data);
  ensureProdukTerdaftar(produk, 0);

  document.getElementById('formProduksi').reset();
  document.getElementById('produksiTanggal').value = todayISO();
  resetProduksiRows(2);

  refreshAll();
});

function renderProduksi() {
  renderTable(KEYS.produksi, 'produksiBody', 'produksiEmpty', item => {
    const bahanList = (item.bahanDipakai && item.bahanDipakai.length)
      ? item.bahanDipakai.map(b => `${escapeHtml(b.bahan)} (${b.jumlah})`).join(', ')
      : '—';
    return `
      <td>${item.tanggal}</td>
      <td>${escapeHtml(item.produk)}</td>
      <td class="num">${item.jumlah}</td>
      <td>${bahanList}</td>
      <td>${escapeHtml(item.catatan || '—')}</td>
      <td><button class="del-btn" data-id="${item.id}">Hapus</button></td>
    `;
  });
}
