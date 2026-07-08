/**
 * stok.js
 * Modul Stok Bahan Baku: dihitung turunan (bukan disimpan langsung) dari
 * data Pembelian (masuk) dan Produksi (keluar).
 *
 * Kunci internal pakai nama bahan huruf kecil + trim, supaya "Tepung" dan
 * "tepung" dianggap bahan yang sama.
 */

function computeStok() {
  const beli = DB.get(KEYS.beli);
  const produksi = DB.get(KEYS.produksi);
  const stok = {}; // key: lowercase nama bahan -> { nama, satuan, masuk, keluar, stok }

  beli.forEach(x => {
    const key = (x.bahan || '').trim().toLowerCase();
    if (!key) return;
    if (!stok[key]) stok[key] = { nama: x.bahan.trim(), satuan: x.satuan || '', masuk: 0, keluar: 0 };
    stok[key].masuk += x.jumlah;
    if (x.satuan) stok[key].satuan = x.satuan;
  });

  produksi.forEach(p => {
    (p.bahanDipakai || []).forEach(b => {
      const key = (b.bahan || '').trim().toLowerCase();
      if (!key) return;
      if (!stok[key]) stok[key] = { nama: b.bahan.trim(), satuan: '', masuk: 0, keluar: 0 };
      stok[key].keluar += b.jumlah;
    });
  });

  Object.values(stok).forEach(s => { s.stok = s.masuk - s.keluar; });
  return stok;
}

function renderStok() {
  const stok = computeStok();
  const rows = Object.values(stok).sort((a, b) => a.nama.localeCompare(b.nama));
  const tbody = document.getElementById('stokBody');
  const empty = document.getElementById('stokEmpty');
  tbody.innerHTML = '';

  if (rows.length === 0) {
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    rows.forEach(s => {
      const tr = document.createElement('tr');
      if (s.stok < 0) tr.classList.add('stok-minus');
      tr.innerHTML = `
        <td>${escapeHtml(s.nama)}</td>
        <td>${escapeHtml(s.satuan || '—')}</td>
        <td class="num">${s.masuk.toLocaleString('id-ID')}</td>
        <td class="num">${s.keluar.toLocaleString('id-ID')}</td>
        <td class="num">${s.stok.toLocaleString('id-ID')}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // datalist nama bahan dipakai bersama oleh form Pembelian & Produksi (autocomplete)
  const datalist = document.getElementById('bahanDatalist');
  datalist.innerHTML = rows.map(s => `<option value="${escapeHtml(s.nama)}">`).join('');
}
