/**
 * pembelian.js
 * Modul Pembelian: pencatatan pembelian bahan baku, multi-baris per submit.
 * Setiap baris otomatis menambah stok bahan (lihat stok.js untuk perhitungannya).
 */

const pembelianRowsBody = document.getElementById('pembelianRows');

function makePembelianRow() {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" class="row-bahan" list="bahanDatalist" placeholder="cth. Tepung terigu"></td>
    <td><input type="number" step="any" min="0" class="row-jumlah" placeholder="0"></td>
    <td><input type="text" class="row-satuan" placeholder="kg / pcs / liter"></td>
    <td><input type="number" step="any" min="0" class="row-harga" placeholder="0"></td>
    <td><button type="button" class="del-btn row-remove">Hapus</button></td>
  `;
  tr.querySelector('.row-remove').addEventListener('click', () => {
    if (pembelianRowsBody.children.length > 1) tr.remove();
  });
  return tr;
}

function resetPembelianRows(jumlahBaris) {
  pembelianRowsBody.innerHTML = '';
  for (let i = 0; i < jumlahBaris; i++) pembelianRowsBody.appendChild(makePembelianRow());
}

document.getElementById('addPembelianRow').addEventListener('click', () => {
  pembelianRowsBody.appendChild(makePembelianRow());
});

resetPembelianRows(3);

document.getElementById('formPembelian').addEventListener('submit', e => {
  e.preventDefault();
  const tanggal = document.getElementById('pembelianTanggal').value;
  const supplier = document.getElementById('pembelianSupplier').value;

  const rows = Array.from(document.querySelectorAll('#pembelianRows tr'));
  const newItems = [];
  let skipped = 0;

  rows.forEach(row => {
    const bahan = row.querySelector('.row-bahan').value.trim();
    const jumlah = parseFloat(row.querySelector('.row-jumlah').value) || 0;
    const satuan = row.querySelector('.row-satuan').value.trim();
    const harga = parseFloat(row.querySelector('.row-harga').value) || 0;

    if (!bahan && !jumlah && !satuan && !harga) return; // baris kosong, lewati diam-diam
    if (!bahan || !jumlah || !satuan) { skipped++; return; } // baris terisi sebagian

    newItems.push({
      id: uid(), tanggal, bahan, jumlah, satuan, harga,
      total: jumlah * harga, supplier
    });
  });

  if (newItems.length === 0) {
    alert('Belum ada baris yang terisi lengkap (nama bahan, jumlah, dan satuan wajib diisi).');
    return;
  }
  if (skipped > 0) {
    alert(`${skipped} baris dilewati karena belum lengkap. ${newItems.length} baris berhasil disimpan.`);
  }

  const data = DB.get(KEYS.beli);
  newItems.forEach(item => data.push(item));
  DB.set(KEYS.beli, data);

  resetPembelianRows(3);
  document.getElementById('pembelianSupplier').value = '';

  refreshAll();
});

function renderPembelian() {
  renderTable(KEYS.beli, 'pembelianBody', 'pembelianEmpty', item => `
    <td>${item.tanggal}</td>
    <td>${escapeHtml(item.bahan)}</td>
    <td class="num">${item.jumlah} ${escapeHtml(item.satuan)}</td>
    <td class="num">${rupiah(item.harga)}</td>
    <td class="num">${rupiah(item.total)}</td>
    <td>${escapeHtml(item.supplier || '—')}</td>
    <td><button class="del-btn" data-id="${item.id}">Hapus</button></td>
  `);
}
