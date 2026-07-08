/**
 * laporan.js
 * Modul Laporan: grafik penjualan vs pembelian per bulan, grafik produksi
 * per produk, dan tabel produk terlaris. Pakai Chart.js (dimuat via CDN).
 *
 * renderCharts() sengaja dipanggil hanya saat tab Laporan dibuka (bukan di
 * setiap refreshAll), karena Chart.js butuh elemen <canvas> yang sudah
 * terlihat/berukuran untuk render dengan benar.
 */

let chartBulanan = null;
let chartProduksi = null;

function renderCharts() {
  const beli = DB.get(KEYS.beli);
  const jual = DB.get(KEYS.jual);
  const produksi = DB.get(KEYS.produksi);

  renderChartBulanan(beli, jual);
  renderChartProduksi(produksi);
  renderTabelTerlaris(jual);
}

function renderChartBulanan(beli, jual) {
  const months = {};
  function addMonth(arr, field) {
    arr.forEach(x => {
      const m = x.tanggal ? x.tanggal.slice(0, 7) : 'n/a';
      months[m] = months[m] || { beli: 0, jual: 0 };
      months[m][field] += x.total;
    });
  }
  addMonth(beli, 'beli');
  addMonth(jual, 'jual');
  const sortedMonths = Object.keys(months).sort();

  const ctx = document.getElementById('chartBulanan');
  if (chartBulanan) chartBulanan.destroy();
  chartBulanan = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedMonths.length ? sortedMonths : ['Belum ada data'],
      datasets: [
        { label: 'Penjualan', data: sortedMonths.map(m => months[m].jual), backgroundColor: '#c8871e' },
        { label: 'Pembelian', data: sortedMonths.map(m => months[m].beli), backgroundColor: '#223148' }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
      scales: { y: { ticks: { callback: v => Number(v).toLocaleString('id-ID') } } }
    }
  });
}

function renderChartProduksi(produksi) {
  const byProduct = {};
  produksi.forEach(x => { byProduct[x.produk] = (byProduct[x.produk] || 0) + x.jumlah; });
  const labels = Object.keys(byProduct);

  const ctx = document.getElementById('chartProduksi');
  if (chartProduksi) chartProduksi.destroy();
  chartProduksi = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.length ? labels : ['Belum ada data'],
      datasets: [{
        data: labels.length ? labels.map(l => byProduct[l]) : [1],
        backgroundColor: ['#c8871e', '#223148', '#3d5372', '#3f6b4a', '#a83f3f', '#e0a94a']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
    }
  });
}

function renderTabelTerlaris(jual) {
  const salesByProduct = {};
  jual.forEach(x => {
    salesByProduct[x.produk] = salesByProduct[x.produk] || { unit: 0, nilai: 0 };
    salesByProduct[x.produk].unit += x.jumlah;
    salesByProduct[x.produk].nilai += x.total;
  });

  const topList = Object.entries(salesByProduct).sort((a, b) => b[1].unit - a[1].unit).slice(0, 8);
  const tbody = document.getElementById('terlarisBody');
  tbody.innerHTML = '';

  if (topList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty">Belum ada data penjualan.</td></tr>';
    return;
  }

  topList.forEach(([produk, v]) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(produk)}</td>
      <td class="num">${v.unit.toLocaleString('id-ID')}</td>
      <td class="num">${rupiah(v.nilai)}</td>
    `;
    tbody.appendChild(tr);
  });
}
