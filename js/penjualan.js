/**
 * penjualan.js
 * Modul Penjualan: pencatatan penjualan produk, multi-baris per submit.
 * Nama produk pakai autocomplete dari katalog (produk.js) dan otomatis
 * mendaftarkan produk baru jika belum ada di katalog.
 */

const penjualanRowsBody = document.getElementById('penjualanRows');

function makePenjualanRow() {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" class="row-produk" list="produkDatalist" placeholder="cth. Roti coklat"></td>
    <td><input type="number" step="any" min="0" class="row-jumlah" placeholder="0"></td>
    <td><input type="number" step="any" min="0" class="row-harga" placeholder="0"></td>
    <td><button type="button" class="del-btn row-remove">Hapus</button></td>
  `;
  tr.querySelector('.row-remove').addEventListener('click', () => {
    if (penjualanRowsBody.children.length > 1) tr.remove();
  });

  // saat pilih/ketik nama produk yang sudah terdaftar, isi otomatis harga jual default
  // (hanya kalau kolom harga masih kosong, supaya tidak menimpa input manual)
  tr.querySelector('.row-produk').addEventListener('change', (e) => {
    const p = findProduk(e.target.value);
    const hargaField = tr.querySelector('.row-harga');
    if (p && p.harga && !hargaField.value) {
      hargaField.value = p.harga;
    }
  });

  return tr;
}

function resetPenjualanRows(jumlahBaris) {
  penjualanRowsBody.innerHTML = '';
  for (let i = 0; i < jumlahBaris; i++) penjualanRowsBody.appendChild(makePenjualanRow());
}

document.getElementById('addPenjualanRow').addEventListener('click', () => {
  penjualanRowsBody.appendChild(makePenjualanRow());
});

resetPenjualanRows(3);

document.getElementById('formPenjualan').addEventListener('submit', e => {
  e.preventDefault();
  const tanggal = document.getElementById('penjualanTanggal').value;
  const pelanggan = document.getElementById('penjualanPelanggan').value;

  const rows = Array.from(document.querySelectorAll('#penjualanRows tr'));
  const newItems = [];
  let skipped = 0;

  rows.forEach(row => {
    const produk = row.querySelector('.row-produk').value.trim();
    const jumlah = parseFloat(row.querySelector('.row-jumlah').value) || 0;
    const harga = parseFloat(row.querySelector('.row-harga').value) || 0;

    if (!produk && !jumlah && !harga) return;
    if (!produk || !jumlah) { skipped++; return; }

    newItems.push({
      id: uid(), tanggal, produk, jumlah, harga,
      total: jumlah * harga, pelanggan
    });
  });

  if (newItems.length === 0) {
    alert('Belum ada baris yang terisi lengkap (nama produk dan jumlah wajib diisi).');
    return;
  }
  if (skipped > 0) {
    alert(`${skipped} baris dilewati karena belum lengkap. ${newItems.length} baris berhasil disimpan.`);
  }

  const data = DB.get(KEYS.jual);
  newItems.forEach(item => {
    data.push(item);
    ensureProdukTerdaftar(item.produk, item.harga);
  });
  DB.set(KEYS.jual, data);

  resetPenjualanRows(3);
  document.getElementById('penjualanPelanggan').value = '';

  refreshAll();
});

function renderPenjualan() {
  renderTable(KEYS.jual, 'penjualanBody', 'penjualanEmpty', item => `
    <td>${item.tanggal}</td>
    <td>${escapeHtml(item.produk)}</td>
    <td class="num">${item.jumlah}</td>
    <td class="num">${rupiah(item.harga)}</td>
    <td class="num">${rupiah(item.total)}</td>
    <td>${escapeHtml(item.pelanggan || '—')}</td>
    <td><button class="del-btn" data-id="${item.id}">Hapus</button></td>
  `);
}
