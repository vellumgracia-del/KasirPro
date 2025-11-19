document.addEventListener('DOMContentLoaded', () => {

    // === DATABASE PRODUK (Data Awal/Default) ===
    const dataProdukDefault = [
        { id: 1, nama: "Nasi Goreng Spesial", kategori: "makanan", modal: 15000, harga: 25000, stok: 50, gambar: "https://placehold.co/150x150/1e293b/94a3b8?text=Nasi+Goreng" },
        { id: 2, nama: "Ayam Bakar Madu", kategori: "makanan", modal: 25000, harga: 35000, stok: 30, gambar: "https://placehold.co/150x150/1e293b/94a3b8?text=Ayam+Bakar" },
        { id: 3, nama: "Soto Ayam Lamongan", kategori: "makanan", modal: 12000, harga: 20000, stok: 40, gambar: "https://placehold.co/150x150/1e293b/94a3b8?text=Soto+Ayam" },
    ];

    // === STATE APLIKASI ===
    let allProducts = []; 
    let keranjang = []; 
    let riwayatPenjualan = [];
    let filterKategori = 'semua';
    let searchTerm = '';
    let namaToko = "Toko Sejahtera";
    let logoDataUrl = null; 
    let categories = [];
    let lastTransaction = null; 
    let pajakPersen = 11; 
    let labaKotorGlobal = 0; 
    let currentlyEditingProductId = null;

    // === ELEMEN DOM (KASIR) ===
    const productGrid = document.getElementById('product-grid');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartEmptyMessage = document.getElementById('cart-empty-message');
    const subtotalEl = document.getElementById('subtotal');
    const pajakEl = document.getElementById('pajak');
    const totalEl = document.getElementById('total');
    const jumlahBayarInput = document.getElementById('jumlah-bayar');
    const kembalianEl = document.getElementById('kembalian');
    const btnBayar = document.getElementById('btn-bayar');
    const btnBaru = document.getElementById('btn-baru');
    const kategoriFilter = document.getElementById('kategori-filter');
    const searchInput = document.getElementById('search-input');
    const successModal = document.getElementById('success-modal');
    const btnTutupModal = document.getElementById('btn-tutup-modal');
    const modalTotal = document.getElementById('modal-total');
    const modalKembalian = document.getElementById('modal-kembalian');
    const notifikasiEl = document.getElementById('notifikasi');
    const namaTokoDisplay = document.getElementById('nama-toko-display');
    const logoContainer = document.getElementById('logo-container');
    const btnCetakResi = document.getElementById('btn-cetak-resi');
    const customerNameInput = document.getElementById('customer-name');
    const pajakLabel = document.getElementById('pajak-label'); 

    // === ELEMEN DOM (NAVIGASI & HALAMAN) ===
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page-content');
    
    // === ELEMEN DOM (HALAMAN PRODUK) ===
    const formTambahProduk = document.getElementById('form-tambah-produk');
    const daftarProdukAdminContainer = document.getElementById('daftar-produk-admin');
    const prodKategoriSelect = document.getElementById('prod-kategori');
    const prodModalInput = document.getElementById('prod-modal');
    const formProdukTitle = document.getElementById('form-produk-title');
    const btnSubmitProduk = document.getElementById('btn-submit-produk');
    const btnCancelEdit = document.getElementById('btn-cancel-edit');

    // === ELEMEN DOM (HALAMAN PENGATURAN) ===
    const formSettingNama = document.getElementById('form-setting-nama');
    const settingNamaTokoInput = document.getElementById('setting-nama-toko');
    const formSettingPajak = document.getElementById('form-setting-pajak');
    const settingPajakInput = document.getElementById('setting-pajak');
    const settingLogoFileInput = document.getElementById('setting-logo-file');
    const logoDropZone = document.getElementById('logo-drop-zone');
    const logoPreview = document.getElementById('logo-preview');
    const logoPlaceholderIcon = document.getElementById('logo-placeholder-icon');
    const formTambahKategori = document.getElementById('form-tambah-kategori');
    const kategoriBaruNamaInput = document.getElementById('kategori-baru-nama');
    const daftarKategoriAdmin = document.getElementById('daftar-kategori-admin');
    const btnResetData = document.getElementById('btn-reset-data'); 

    // === ELEMEN DOM (HALAMAN RIWAYAT) ===
    const riwayatContainer = document.getElementById('riwayat-container');
    const riwayatEmptyMessage = document.getElementById('riwayat-empty-message');

    // === ELEMEN DOM (HALAMAN PEMBUKUAN) ===
    const totalPenjualanDisplay = document.getElementById('total-penjualan-display');
    const totalModalDisplay = document.getElementById('total-modal-display');
    const labaKotorDisplay = document.getElementById('laba-kotor-display');
    const biayaOperasionalInput = document.getElementById('biaya-operasional-input');
    const btnHitungLabaBersih = document.getElementById('btn-hitung-laba-bersih');
    const labaBersihDisplay = document.getElementById('laba-bersih-display');
    const dailyReportBody = document.getElementById('daily-report-body');

    // === ELEMEN DOM (SETUP MODAL) ===
    const setupModal = document.getElementById('setup-modal');
    const setupForm = document.getElementById('setup-form');
    const setupNamaTokoInput = document.getElementById('setup-nama-toko');
    const setupLogoFileInput = document.getElementById('setup-logo-file');


    // === FUNGSI ===

    // --- FUNGSI PENYIMPANAN (SAVE) ---
    const simpanProduk = () => {
        localStorage.setItem('kasir_products', JSON.stringify(allProducts));
    };
    const simpanKategori = () => {
        localStorage.setItem('kasir_categories', JSON.stringify(categories));
    };
    const simpanRiwayat = () => {
        localStorage.setItem('kasir_history', JSON.stringify(riwayatPenjualan));
    };
    const simpanNamaToko = () => {
        localStorage.setItem('kasir_storeName', namaToko);
    };
    const simpanLogo = () => {
        if(logoDataUrl) {
            localStorage.setItem('kasir_logo', logoDataUrl);
        }
    };
    const simpanPajak = () => {
        localStorage.setItem('kasir_taxPercent', pajakPersen.toString());
    };
    const setSetupComplete = () => {
        localStorage.setItem('kasir_setupComplete', 'true');
    };

    // --- FUNGSI PEMUATAN (LOAD) ---
    const muatData = () => {
        const dataProduk = localStorage.getItem('kasir_products');
        const dataKategori = localStorage.getItem('kasir_categories');
        const dataRiwayat = localStorage.getItem('kasir_history');
        const dataNamaToko = localStorage.getItem('kasir_storeName');
        const dataLogo = localStorage.getItem('kasir_logo');
        const dataPajak = localStorage.getItem('kasir_taxPercent');
        
        allProducts = dataProduk ? JSON.parse(dataProduk) : dataProdukDefault;
        categories = dataKategori ? JSON.parse(dataKategori) : ['semua', 'makanan', 'minuman', 'snack'];
        riwayatPenjualan = dataRiwayat ? JSON.parse(dataRiwayat).map(trx => ({...trx, tanggal: new Date(trx.tanggal)})) : [];
        namaToko = dataNamaToko ? dataNamaToko : "Toko Sejahtera";
        logoDataUrl = dataLogo ? dataLogo : null;
        pajakPersen = dataPajak ? parseFloat(dataPajak) : 11;
    };

    // --- FUNGSI INISIALISASI APLIKASI ---
    const initApp = () => {
        renderNamaToko();
        renderLogo();
        renderPajak(); 
        renderKategoriFilters();
        renderKategoriOptions();
        renderProduk();
        renderKeranjang();
        renderDaftarProdukAdmin();
        renderDaftarKategoriAdmin();
    };
    
    let notifikasiTimeout;
    const showNotifikasi = (pesan, tipe = 'error') => {
        clearTimeout(notifikasiTimeout); 
        notifikasiEl.textContent = pesan;
        notifikasiEl.classList.remove('hidden', 'bg-red-600', 'bg-green-600');
        if (tipe === 'error') {
            notifikasiEl.classList.add('bg-red-600');
        } else if (tipe === 'sukses') {
            notifikasiEl.classList.add('bg-green-600');
        }
        notifikasiTimeout = setTimeout(() => {
            notifikasiEl.classList.add('hidden');
        }, 3000);
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka);
    };
    
    const renderNamaToko = () => {
        namaTokoDisplay.textContent = namaToko;
        settingNamaTokoInput.value = namaToko; 
    };

    const renderPajak = () => {
        pajakLabel.textContent = `Pajak (${pajakPersen}%)`;
        settingPajakInput.value = pajakPersen;
        updateTotal();
    };

    const renderLogo = () => {
        if (logoDataUrl) {
            logoContainer.innerHTML = `<img src="${logoDataUrl}" alt="Logo Toko" class="w-full h-full rounded-lg object-cover">`;
            logoContainer.className = 'w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden';
            logoPreview.src = logoDataUrl;
            logoPreview.classList.remove('hidden');
            logoPlaceholderIcon.classList.add('hidden');
        } else {
            logoContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7V2h5l2 5-2 5-5-5Z"/><path d="m14 7 5 5-5 5V7Z"/><path d="M9 12 7 7l5 5-5 5Z"/><path d="m16 12 5 5-5-5-5 5Z"/></svg>`;
            logoContainer.className = 'w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center'; // Pakai hardcode
            logoPreview.src = '';
            logoPreview.classList.add('hidden');
            logoPlaceholderIcon.classList.remove('hidden');
        }
    };


    const renderKategoriFilters = () => {
        kategoriFilter.innerHTML = ''; 
        categories.forEach(kategori => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.dataset.kategori = kategori;
            button.textContent = kategori.charAt(0).toUpperCase() + kategori.slice(1); 
            button.className = 'kategori-btn px-4 py-2 rounded-full font-semibold transition-colors';
            if (kategori === filterKategori) {
                button.classList.add('bg-cyan-600', 'text-white');
            } else {
                button.classList.add('bg-slate-700', 'text-slate-300', 'hover:bg-slate-600');
            }
            li.appendChild(button);
            kategoriFilter.appendChild(li);
        });
    };
    
    const renderKategoriOptions = () => {
        prodKategoriSelect.innerHTML = ''; 
        categories.forEach(kategori => {
            if (kategori === 'semua') return; 
            const option = document.createElement('option');
            option.value = kategori;
            option.textContent = kategori.charAt(0).toUpperCase() + kategori.slice(1);
            prodKategoriSelect.appendChild(option);
        });
    };
    
    const renderDaftarKategoriAdmin = () => {
        daftarKategoriAdmin.innerHTML = ''; 
        const adminCategories = categories.filter(k => k !== 'semua');
        if (adminCategories.length === 0) {
            daftarKategoriAdmin.innerHTML = `<p class="text-slate-500 text-sm">Belum ada kategori kustom.</p>`;
            return;
        }
        adminCategories.forEach(kategori => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between bg-slate-700 px-3 py-2 rounded-lg';
            item.innerHTML = `
                <span class="text-sm font-medium text-white">${kategori.charAt(0).toUpperCase() + kategori.slice(1)}</span>
                <button class="btn-hapus-kategori text-red-500 hover:text-red-400" data-kategori="${kategori}" title="Hapus Kategori">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;
            daftarKategoriAdmin.appendChild(item);
        });
    };

    const pindahHalaman = (targetPageId) => {
        pages.forEach(page => page.classList.add('hidden'));
        const targetPage = document.getElementById(targetPageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
        }
        
        navButtons.forEach(btn => {
            if (btn.dataset.page === targetPageId) {
                btn.classList.add('bg-cyan-600', 'text-white');
                btn.classList.remove('text-slate-400', 'hover:bg-slate-700');
            } else {
                btn.classList.remove('bg-cyan-600', 'text-white');
                btn.classList.add('text-slate-400', 'hover:bg-slate-700');
            }
        });
        
        if (targetPageId === 'halaman-kasir') {
            renderKategoriFilters();
        } else if (targetPageId === 'halaman-produk') {
            renderDaftarProdukAdmin();
            renderKategoriOptions(); 
        } else if (targetPageId === 'halaman-riwayat') {
            renderRiwayat();
        } else if (targetPageId === 'halaman-pembukuan') {
            renderPembukuan();
        } else if (targetPageId === 'halaman-pengaturan') {
            renderDaftarKategoriAdmin();
            renderNamaToko();
            renderPajak();
            renderLogo();
        }
    };

    const renderProduk = () => {
        productGrid.innerHTML = ''; 
        const filteredProducts = allProducts.filter(produk => {
            const matchKategori = (filterKategori === 'semua' || produk.kategori === filterKategori);
            const matchSearch = (produk.nama.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchKategori && matchSearch;
        });

        if (filteredProducts.length === 0) {
            productGrid.innerHTML = `<p class="col-span-full text-slate-400 text-center">Produk tidak ditemukan.</p>`;
            return;
        }

        filteredProducts.forEach(produk => {
            const productCard = document.createElement('div');
            productCard.className = `bg-slate-800 rounded-lg shadow-lg overflow-hidden relative ${produk.stok > 0 ? 'cursor-pointer transform transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]' : 'opacity-50 cursor-not-allowed'}`;
            productCard.innerHTML = `
                <img src="${produk.gambar}" alt="${produk.nama}" class="w-full h-32 object-cover">
                <div class="p-4">
                    <h3 class="font-semibold text-white text-sm truncate">${produk.nama}</h3>
                    <p class="text-cyan-400 text-sm font-bold mt-1">${formatRupiah(produk.harga)}</p>
                    <p class="text-xs text-slate-400 mt-1">Stok: ${produk.stok}</p>
                </div>
                ${produk.stok <= 0 ? `
                    <div class="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                        <span class="text-white font-bold text-lg border-2 border-white px-4 py-2 rounded-md">Stok Habis</span>
                    </div>
                ` : ''}
            `;
            if (produk.stok > 0) {
                productCard.addEventListener('click', () => tambahKeKeranjang(produk.id));
            }
            productGrid.appendChild(productCard);
        });
    };

    const tambahKeKeranjang = (id) => {
        const produk = allProducts.find(p => p.id === id);
        if (produk.stok <= 0) {
            showNotifikasi("Stok produk ini sudah habis.");
            return;
        }
        const itemDiKeranjang = keranjang.find(item => item.id === id);
        const jumlahDiKeranjang = itemDiKeranjang ? itemDiKeranjang.jumlah : 0;
        if (jumlahDiKeranjang >= produk.stok) {
            showNotifikasi("Stok di keranjang sudah maksimal (total stok: " + produk.stok + ").");
            return;
        }
        if (itemDiKeranjang) {
            itemDiKeranjang.jumlah++;
        } else {
            keranjang.push({ ...produk, jumlah: 1 });
        }
        renderKeranjang();
    };

    const ubahJumlahItem = (id, delta) => {
        const itemDiKeranjang = keranjang.find(item => item.id === id);
        if (!itemDiKeranjang) return;

        const produk = allProducts.find(p => p.id === id);
        const jumlahBaru = itemDiKeranjang.jumlah + delta;

        if (delta > 0 && jumlahBaru > produk.stok) {
            showNotifikasi("Stok tidak mencukupi (total stok: " + produk.stok + ").");
            itemDiKeranjang.jumlah = produk.stok; 
        } else if (jumlahBaru <= 0) {
            keranjang = keranjang.filter(item => item.id !== id);
        } else {
            itemDiKeranjang.jumlah = jumlahBaru;
        }
        
        renderKeranjang();
    };

    const setJumlahItem = (id, newQty) => {
        const itemDiKeranjang = keranjang.find(item => item.id === id);
        if (!itemDiKeranjang) return;

        const produk = allProducts.find(p => p.id === id);
        
        if (isNaN(newQty)) {
            renderKeranjang();
            return;
        }

        if (newQty > produk.stok) {
            showNotifikasi("Stok tidak mencukupi (total stok: " + produk.stok + ").");
            itemDiKeranjang.jumlah = produk.stok; 
        } else if (newQty < 1) {
            keranjang = keranjang.filter(item => item.id !== id);
        } else {
            itemDiKeranjang.jumlah = newQty;
        }
        
        renderKeranjang(); 
    };

    const renderKeranjang = () => {
        cartItemsContainer.innerHTML = '';
        if (keranjang.length === 0) {
            cartEmptyMessage.classList.remove('hidden');
        } else {
            cartEmptyMessage.classList.add('hidden');
            keranjang.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'flex justify-between items-center mb-4 pb-4 border-b border-slate-700';
                cartItem.innerHTML = `
                    <div class="flex items-center w-2/5">
                        <img src="${item.gambar}" alt="${item.nama}" class="w-12 h-12 rounded-lg mr-3 object-cover flex-shrink-0">
                        <div class="overflow-hidden">
                            <h4 class="text-sm font-semibold text-white truncate">${item.nama}</h4>
                            <p class="text-xs text-slate-400">${formatRupiah(item.harga)}</p>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <button class="btn-kurang w-7 h-7 bg-slate-700 rounded-full font-bold text-lg text-cyan-400 hover:bg-slate-600">-</button>
                        <input 
                            type="number" 
                            class="cart-item-qty-input mx-1 w-12 text-center bg-slate-700 border border-slate-600 text-white rounded-md p-1" 
                            value="${item.jumlah}" 
                            data-id="${item.id}"
                            min="1"
                        >
                        <button class="btn-tambah w-7 h-7 bg-slate-700 rounded-full font-bold text-lg text-cyan-400 hover:bg-slate-600">+</button>
                    </div>
                    <p class="text-sm font-semibold text-white w-1/4 text-right">${formatRupiah(item.harga * item.jumlah)}</p>
                `;

                cartItem.querySelector('.btn-kurang').addEventListener('click', () => ubahJumlahItem(item.id, -1));
                cartItem.querySelector('.btn-tambah').addEventListener('click', () => ubahJumlahItem(item.id, 1));

                cartItem.querySelector('.cart-item-qty-input').addEventListener('change', (e) => {
                    const id = parseInt(e.target.dataset.id);
                    const newQty = parseInt(e.target.value);
                    setJumlahItem(id, newQty);
                });

                cartItemsContainer.appendChild(cartItem);
            });
        }
        updateTotal();
    };

    const updateTotal = () => {
        const subtotal = keranjang.reduce((acc, item) => acc + (item.harga * item.jumlah), 0);
        const pajak = subtotal * (pajakPersen / 100); 
        const total = subtotal + pajak;
        subtotalEl.textContent = formatRupiah(subtotal);
        pajakEl.textContent = formatRupiah(pajak);
        totalEl.textContent = formatRupiah(total);
        btnBayar.disabled = (keranjang.length === 0);
        hitungKembalian();
    };

    const formatInputBayar = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        e.target.value = value;
        hitungKembalian();
    };
    
    const hitungKembalian = () => {
        const subtotal = keranjang.reduce((acc, item) => acc + (item.harga * item.jumlah), 0);
        const pajak = subtotal * (pajakPersen / 100); 
        const total = subtotal + pajak;
        
        let jumlahBayar = parseFloat(jumlahBayarInput.value.replace(/[^0-9]/g, ''));
        if (isNaN(jumlahBayar) || jumlahBayar < total) {
            kembalianEl.textContent = "Rp 0";
            kembalianEl.classList.remove('text-cyan-400');
            kembalianEl.classList.add('text-red-500');
            btnBayar.disabled = true;
        } else {
            const kembalian = jumlahBayar - total;
            kembalianEl.textContent = formatRupiah(kembalian);
            kembalianEl.classList.add('text-cyan-400');
            kembalianEl.classList.remove('text-red-500');
            btnBayar.disabled = false;
        }
        if (keranjang.length === 0) {
            btnBayar.disabled = true;
        }
    };
    
    const prosesBayar = () => {
        const subtotal = keranjang.reduce((acc, item) => acc + (item.harga * item.jumlah), 0);
        const pajak = subtotal * (pajakPersen / 100);
        const total = subtotal + pajak;
        let jumlahBayar = parseFloat(jumlahBayarInput.value.replace(/[^0-9]/g, ''));
        const kembalian = jumlahBayar - total;
        const namaPelanggan = customerNameInput.value.trim();

        keranjang.forEach(itemKeranjang => {
            const produkDiDb = allProducts.find(p => p.id === itemKeranjang.id);
            if (produkDiDb) {
                produkDiDb.stok -= itemKeranjang.jumlah;
            }
        });
        
        const transaksi = {
            id: `TRX-${new Date().getTime()}`,
            tanggal: new Date(), 
            pelanggan: namaPelanggan || 'Walk-in', 
            items: JSON.parse(JSON.stringify(keranjang)), 
            subtotal: subtotal,
            pajak: pajak,
            pajakPersen: pajakPersen, 
            total: total,
            bayar: jumlahBayar,
            kembalian: kembalian
        };
        riwayatPenjualan.push(transaksi);
        lastTransaction = transaksi;

        simpanProduk(); 
        simpanRiwayat(); 

        modalTotal.textContent = formatRupiah(total);
        modalKembalian.textContent = formatRupiah(kembalian);
        successModal.classList.remove('hidden');
        successModal.querySelector('div').classList.add('scale-100');
    };
    
    const mulaiBaru = () => {
        keranjang = [];
        jumlahBayarInput.value = '';
        customerNameInput.value = ''; 
        renderKeranjang();
        kembalianEl.textContent = "Rp 0";
        kembalianEl.classList.add('text-cyan-400');
        kembalianEl.classList.remove('text-red-500');
        lastTransaction = null;
    };
    
    const tutupModal = () => {
        successModal.classList.add('hidden');
        successModal.querySelector('div').classList.remove('scale-100');
        mulaiBaru();
        renderProduk(); 
    };
    
    const handleCetakResi = (transaksiSpesifik = null) => {
        // Jika argumen adalah event (karena di-click), abaikan dan pakai lastTransaction
        // atau jika transaksiSpesifik adalah objek transaksi valid, gunakan itu.
        let trx;
        if (transaksiSpesifik && transaksiSpesifik.id) {
            trx = transaksiSpesifik;
        } else {
            trx = lastTransaction;
        }

        if (!trx) {
            showNotifikasi("Data transaksi tidak ditemukan.");
            return;
        }
        
        let itemsHtml = trx.items.map(item => `
            <tr>
                <td style="padding: 2px 0;">${item.nama}</td>
                <td style="padding: 2px 0; text-align: right;">${item.jumlah} x ${formatRupiah(item.harga)}</td>
                <td style="padding: 2px 0; text-align: right;">${formatRupiah(item.harga * item.jumlah)}</td>
            </tr>
        `).join('');

        const pajakCetak = trx.pajakPersen !== undefined ? trx.pajakPersen : pajakPersen;

        const resiHtml = `
            <style>
                body { font-family: 'Arial', sans-serif; margin: 0; padding: 10px; font-size: 10px; }
                h3 { margin: 0 0 5px 0; text-align: center; }
                p { margin: 2px 0; }
                table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                th { text-align: left; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 4px 0; }
                td { padding: 2px 0; }
                .total-row td { border-top: 1px dashed #000; padding-top: 4px; font-weight: bold; }
                .text-right { text-align: right; }
                @media print { @page { margin: 0; } body { margin: 10px; } }
            </style>
            <h3>${namaToko}</h3>
            <p style="text-align: center;">Struk Pembayaran</p>
            <hr style="border: none; border-top: 1px dashed #000; margin: 5px 0;">
            <p>ID: ${trx.id}</p>
            <p>Tgl: ${new Date(trx.tanggal).toLocaleString('id-ID')}</p>
            ${trx.pelanggan !== 'Walk-in' ? `<p>Pelanggan: ${trx.pelanggan}</p>` : ''}
            <hr style="border: none; border-top: 1px dashed #000; margin: 5px 0;">
            <table>
                <thead>
                    <tr>
                        <th style="width: 40%;">Item</th>
                        <th style="width: 30%; text-align: right;">Jml/Harga</th>
                        <th style="width: 30%; text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody> ${itemsHtml} </tbody>
                <tfoot>
                    <tr class="total-row"><td colspan="2">Subtotal</td><td class="text-right">${formatRupiah(trx.subtotal)}</td></tr>
                    <tr><td colspan="2">Pajak (${pajakCetak}%)</td><td class="text-right">${formatRupiah(trx.pajak)}</td></tr>
                    <tr><td colspan="2" style="font-weight: bold;">TOTAL</td><td class="text-right" style="font-weight: bold;">${formatRupiah(trx.total)}</td></tr>
                    <tr><td colspan="2">Bayar</td><td class="text-right">${formatRupiah(trx.bayar)}</td></tr>
                    <tr><td colspan="2">Kembalian</td><td class="text-right">${formatRupiah(trx.kembalian)}</td></tr>
                </tfoot>
            </table>
            <hr style="border: none; border-top: 1px dashed #000; margin: 5px 0;">
            <p style="text-align: center;">Terima kasih!</p>
        `;

        const printWindow = window.open('', '', 'width=300,height=500');
        printWindow.document.write(resiHtml);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250); 
    };

    const renderDaftarProdukAdmin = () => {
        daftarProdukAdminContainer.innerHTML = '';
        if (allProducts.length === 0) {
            daftarProdukAdminContainer.innerHTML = `<p class="text-slate-500 text-center">Belum ada produk.</p>`;
            return;
        }
        allProducts.slice().reverse().forEach(produk => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between bg-slate-700 p-3 rounded-lg';
            item.innerHTML = `
                <div class="flex items-center overflow-hidden mr-2">
                    <img src="${produk.gambar}" alt="${produk.nama}" class="w-10 h-10 rounded-lg mr-3 object-cover flex-shrink-0">
                    <div class="overflow-hidden">
                        <h4 class="text-sm font-semibold text-white truncate">${produk.nama}</h4>
                        <p class="text-xs text-slate-400 truncate">Modal: ${formatRupiah(produk.modal || 0)} | Jual: ${formatRupiah(produk.harga)} | Stok: ${produk.stok}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2 flex-shrink-0">
                    <span class="text-xs font-medium bg-slate-600 px-2 py-1 rounded-full">${produk.kategori}</span>
                    <button class="btn-edit-produk text-cyan-400 hover:text-cyan-500" data-id="${produk.id}" title="Edit Produk">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg>
                    </button>
                    <button class="btn-hapus-produk text-red-500 hover:text-red-400" data-id="${produk.id}" title="Hapus Produk">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `;
            daftarProdukAdminContainer.appendChild(item);
        });
    };
    
    const resetFormProduk = () => {
        formProdukTitle.textContent = "Tambah Produk Baru";
        btnSubmitProduk.textContent = "Tambahkan Produk";
        btnSubmitProduk.classList.remove('bg-yellow-500', 'hover:bg-yellow-400');
        btnSubmitProduk.classList.add('bg-cyan-600', 'hover:bg-cyan-500');
        btnCancelEdit.classList.add('hidden');
        
        formTambahProduk.reset();
        document.getElementById('prod-gambar-file').value = '';
        currentlyEditingProductId = null;
    };

    const handleEditProduk = (id) => {
        const produk = allProducts.find(p => p.id === id);
        if (!produk) return;

        currentlyEditingProductId = id;

        document.getElementById('prod-nama').value = produk.nama;
        document.getElementById('prod-kategori').value = produk.kategori;
        document.getElementById('prod-modal').value = produk.modal || 0;
        document.getElementById('prod-harga').value = produk.harga;
        document.getElementById('prod-stok').value = produk.stok;
        
        formProdukTitle.textContent = `Edit Produk: ${produk.nama}`;
        btnSubmitProduk.textContent = "Simpan Perubahan";
        btnSubmitProduk.classList.remove('bg-cyan-600', 'hover:bg-cyan-500');
        btnSubmitProduk.classList.add('bg-yellow-500', 'hover:bg-yellow-400');
        btnCancelEdit.classList.remove('hidden');

        formProdukTitle.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    
    const handleSubmitProduk = (e) => {
        e.preventDefault();
        
        const nama = document.getElementById('prod-nama').value;
        const kategori = document.getElementById('prod-kategori').value;
        const modal = parseFloat(prodModalInput.value);
        const harga = parseFloat(document.getElementById('prod-harga').value);
        const stok = parseInt(document.getElementById('prod-stok').value);
        const fileInput = document.getElementById('prod-gambar-file');
        const file = fileInput.files[0];

        if (!kategori) {
            showNotifikasi("Kategori tidak valid. Tambahkan kategori di Pengaturan.", "error");
            return;
        }
        if (isNaN(modal) || modal < 0) {
            showNotifikasi("Harga modal tidak valid.", "error");
            return;
        }
        if (isNaN(harga) || harga < 0) {
            showNotifikasi("Harga jual tidak valid.", "error");
            return;
        }
        if (harga < modal) {
            showNotifikasi("Harga jual tidak boleh lebih rendah dari harga modal.", "error");
            return;
        }
        if (isNaN(stok) || stok < 0) {
             showNotifikasi("Stok tidak valid.", "error");
            return;
        }

        const processSubmit = (gambarDataUrl) => {
            if (currentlyEditingProductId) {
                const produk = allProducts.find(p => p.id === currentlyEditingProductId);
                if (!produk) return;

                produk.nama = nama;
                produk.kategori = kategori;
                produk.modal = modal;
                produk.harga = harga;
                produk.stok = stok;
                if (gambarDataUrl) {
                    produk.gambar = gambarDataUrl;
                }
                
                simpanProduk();
                renderProduk();
                renderDaftarProdukAdmin();
                showNotifikasi("Produk berhasil diperbarui!", "sukses");
                resetFormProduk(); 

            } else {
                const maxId = allProducts.reduce((max, p) => p.id > max ? p.id : max, 0);
                const newId = maxId + 1;
                
                const gambarFinal = gambarDataUrl || `https://placehold.co/150x150/1e293b/94a3b8?text=${nama.replace(/\s+/g, '+')}`;
                
                const newProduct = { id: newId, nama, kategori, modal, harga, stok, gambar: gambarFinal };
                allProducts.push(newProduct);
                
                simpanProduk(); 
                renderProduk(); 
                renderDaftarProdukAdmin(); 
                showNotifikasi("Produk berhasil ditambahkan!", "sukses");
                resetFormProduk(); 
            }
        };

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                processSubmit(reader.result); 
            };
            reader.readAsDataURL(file);
        } else {
            processSubmit(null); 
        }
    };
    
    const hapusProduk = (id) => {
        const idToRemove = parseInt(id);
        allProducts = allProducts.filter(p => p.id !== idToRemove);
        
        const itemDiKeranjang = keranjang.find(item => item.id === idToRemove);
        if (itemDiKeranjang) {
            keranjang = keranjang.filter(item => item.id !== idToRemove);
        }

        if (currentlyEditingProductId === idToRemove) {
            resetFormProduk();
        }
        
        simpanProduk(); 
        
        renderDaftarProdukAdmin(); 
        renderProduk(); 
        if (itemDiKeranjang) {
            renderKeranjang();
        }
        showNotifikasi("Produk berhasil dihapus.", "sukses");
    };
    
    const renderRiwayat = () => {
        riwayatContainer.innerHTML = ''; 
        if (riwayatPenjualan.length === 0) {
            riwayatEmptyMessage.classList.remove('hidden');
        } else {
            riwayatEmptyMessage.classList.add('hidden');
        }
        
        riwayatPenjualan.slice().reverse().forEach(trx => {
            const trxCard = document.createElement('div');
            trxCard.className = 'bg-slate-800 p-5 rounded-lg shadow-lg';
            const itemsHtml = trx.items.map(item => `
                <li class="flex justify-between text-sm text-slate-300">
                    <span>${item.nama} <span class="text-slate-400">x ${item.jumlah}</span></span>
                    <span>${formatRupiah(item.harga * item.jumlah)}</span>
                </li>
            `).join('');

            const pajakCetak = trx.pajakPersen !== undefined ? trx.pajakPersen : pajakPersen;

            trxCard.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h3 class="text-lg font-semibold text-cyan-400">${trx.id}</h3>
                        <p class="text-sm text-white font-medium">${trx.pelanggan}</p> 
                    </div>
                    <div class="flex flex-col items-end">
                        <span class="text-sm text-slate-400 mb-1">${new Date(trx.tanggal).toLocaleString('id-ID')}</span>
                        <button class="btn-print-history text-xs bg-slate-700 hover:bg-slate-600 text-cyan-400 px-2 py-1 rounded flex items-center gap-1 transition-colors" data-id="${trx.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                            Cetak
                        </button>
                    </div>
                </div>
                <ul class="space-y-1 border-b border-slate-700 pb-2 mb-2">
                    ${itemsHtml}
                </ul>
                <div class="space-y-1 text-sm">
                    <div class="flex justify-between text-slate-300"><span>Subtotal:</span> <span>${formatRupiah(trx.subtotal)}</span></div>
                    <div class="flex justify-between text-slate-300"><span>Pajak (${pajakCetak}%):</span> <span>${formatRupiah(trx.pajak)}</span></div>
                    <div class="flex justify-between text-white font-semibold"><span>Total:</span> <span>${formatRupiah(trx.total)}</span></div>
                    <div class="flex justify-between text-slate-300 pt-1 border-t border-slate-700 mt-1"><span>Bayar:</span> <span>${formatRupiah(trx.bayar)}</span></div>
                    <div class="flex justify-between text-cyan-300"><span>Kembalian:</span> <span>${formatRupiah(trx.kembalian)}</span></div>
                </div>
            `;
            riwayatContainer.appendChild(trxCard);
        });

        // Event Delegation untuk tombol cetak di riwayat
        const printButtons = document.querySelectorAll('.btn-print-history');
        printButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Mencegah event bubbling yang tidak diinginkan
                e.stopPropagation();
                const id = e.currentTarget.dataset.id;
                const trx = riwayatPenjualan.find(t => t.id === id);
                if (trx) {
                    handleCetakResi(trx);
                }
            });
        });
    };

    const renderPembukuan = () => {
        let totalPenjualan = 0;
        let totalModal = 0;
        const dailyStats = {};

        riwayatPenjualan.forEach(trx => {
            // Agregat Global
            totalPenjualan += trx.subtotal; // Asumsi omzet = subtotal (sebelum pajak)
            
            // Hitung modal per transaksi
            let trxModal = 0;
            trx.items.forEach(item => {
                trxModal += (item.modal || 0) * item.jumlah;
            });
            totalModal += trxModal;

            // Agregat Harian
            const dateKey = new Date(trx.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
            
            if (!dailyStats[dateKey]) {
                dailyStats[dateKey] = {
                    count: 0,
                    omzet: 0,
                    modal: 0
                };
            }
            
            dailyStats[dateKey].count += 1;
            dailyStats[dateKey].omzet += trx.subtotal;
            dailyStats[dateKey].modal += trxModal;
        });

        labaKotorGlobal = totalPenjualan - totalModal;

        // Update UI Ringkasan Global
        totalPenjualanDisplay.textContent = formatRupiah(totalPenjualan);
        totalModalDisplay.textContent = formatRupiah(totalModal);
        labaKotorDisplay.textContent = formatRupiah(labaKotorGlobal);
        
        biayaOperasionalInput.value = '';
        labaBersihDisplay.textContent = 'Rp 0';

        // Update UI Tabel Harian
        dailyReportBody.innerHTML = '';
        // Urutkan tanggal dari yang terbaru
        const sortedDates = Object.keys(dailyStats).sort((a, b) => new Date(b) - new Date(a)); // Note: sorting localized strings might be tricky, simple sort usually works for ISO, but for LocaleString it depends. For simplicity here we iterate. Ideally use ISO keys for sorting then format.
        
        // Better sorting approach:
        // Re-map to array of objects, sort by date object, then render
        const reportArray = Object.keys(dailyStats).map(key => {
             return { date: key, ...dailyStats[key] };
        });
        // Sort logic needed if strict chronological order is required, 
        // but standard Object.keys iteration order is usually insertion order for non-integer keys in modern JS engines.
        // Since we populate from riwayatPenjualan which is chronological, reportArray should be chronological.
        // Let's reverse to show newest first
        reportArray.reverse().forEach(stat => {
            const row = document.createElement('tr');
            row.className = 'border-b border-slate-700 hover:bg-slate-700/50 transition-colors';
            
            const labaKotorHarian = stat.omzet - stat.modal;
            const profitClass = labaKotorHarian >= 0 ? 'text-green-400' : 'text-red-400';

            row.innerHTML = `
                <td class="p-3 text-slate-300">${stat.date}</td>
                <td class="p-3 text-slate-300">${stat.count}</td>
                <td class="p-3 text-slate-300">${formatRupiah(stat.omzet)}</td>
                <td class="p-3 text-slate-300">${formatRupiah(stat.modal)}</td>
                <td class="p-3 font-medium text-right ${profitClass}">${formatRupiah(labaKotorHarian)}</td>
            `;
            dailyReportBody.appendChild(row);
        });

        if (reportArray.length === 0) {
             dailyReportBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500">Belum ada data transaksi.</td></tr>`;
        }
    };


    // === EVENT LISTENERS ===

    // Navigasi Halaman
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => pindahHalaman(btn.dataset.page));
    });

    // Filter Kategori (Halaman Kasir)
    kategoriFilter.addEventListener('click', (e) => {
        const targetButton = e.target.closest('.kategori-btn');
        if (targetButton) {
            filterKategori = targetButton.dataset.kategori;
            renderKategoriFilters();
            renderProduk();
        }
    });

    // Pencarian Produk (Halaman Kasir)
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderProduk();
    });
    
    // Input Pembayaran (Halaman Kasir)
    jumlahBayarInput.addEventListener('input', formatInputBayar);

    // Tombol Aksi (Halaman Kasir)
    btnBayar.addEventListener('click', prosesBayar);
    btnBaru.addEventListener('click', mulaiBaru);
    
    // Modal
    btnTutupModal.addEventListener('click', tutupModal);
    btnCetakResi.addEventListener('click', () => handleCetakResi(null)); // Call without args for last transaction
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            tutupModal();
        }
    });
    
    // --- EVENT LISTENER (HALAMAN PRODUK) ---
    formTambahProduk.addEventListener('submit', handleSubmitProduk);
    btnCancelEdit.addEventListener('click', resetFormProduk);
    daftarProdukAdminContainer.addEventListener('click', (e) => {
        const hapusTarget = e.target.closest('.btn-hapus-produk');
        const editTarget = e.target.closest('.btn-edit-produk');

        if (hapusTarget) {
            const id = parseInt(hapusTarget.dataset.id); 
            hapusProduk(id);
        } else if (editTarget) { 
            const id = parseInt(editTarget.dataset.id); 
            handleEditProduk(id);
        }
    });
    
    // --- EVENT LISTENER (HALAMAN PENGATURAN) ---
    formSettingNama.addEventListener('submit', (e) => {
        e.preventDefault();
        namaToko = settingNamaTokoInput.value.trim();
        if (namaToko === "") {
            namaToko = "Toko Mulia"; 
        }
        renderNamaToko();
        simpanNamaToko();
        showNotifikasi("Nama toko berhasil diperbarui!", "sukses");
    });

    // --- BARU: Event Listener Tombol Reset ---
    btnResetData.addEventListener('click', () => {
        const konfirmasi = confirm("PERINGATAN: Apakah Anda yakin ingin menghapus data? Data produk dan transaksi akan hilang. Profil toko (nama dan logo) akan TETAP ADA.");
        
        if (konfirmasi) {
            const konfirmasiKedua = confirm("Lanjutkan reset data transaksi?");
            
            if (konfirmasiKedua) {
                // Hapus hanya data spesifik
                localStorage.removeItem('kasir_products');
                localStorage.removeItem('kasir_categories');
                localStorage.removeItem('kasir_history');
                
                // Jangan hapus 'kasir_storeName', 'kasir_logo', 'kasir_taxPercent', 'kasir_setupComplete'
                
                location.reload();
            }
        }
    });

    // --- Event Listener Form Pajak ---
    formSettingPajak.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPajak = parseFloat(settingPajakInput.value);
        if (isNaN(newPajak) || newPajak < 0 || newPajak > 100) {
            showNotifikasi("Silakan masukkan angka pajak yang valid (0-100).", "error");
            return;
        }
        pajakPersen = newPajak;
        renderPajak();
        simpanPajak();
        showNotifikasi("Persentase pajak berhasil diperbarui!", "sukses");
    });

    // --- Fungsi Helper untuk memproses file logo ---
    const handleLogoFile = (file) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showNotifikasi("File tidak valid. Harap unggah file gambar.", "error");
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // Batas 5MB
            showNotifikasi("Ukuran file terlalu besar. Maksimal 5MB.", "error");
            return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
            logoDataUrl = reader.result; 
            renderLogo(); 
            simpanLogo();
            showNotifikasi("Logo berhasil diperbarui!", "sukses");
        };
        reader.readAsDataURL(file);
    };

    // --- Event Listener Logo Modern ---
    logoDropZone.addEventListener('click', () => {
        settingLogoFileInput.click();
    });

    settingLogoFileInput.addEventListener('change', (e) => {
        handleLogoFile(e.target.files[0]);
        e.target.value = null; 
    });

    logoDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        logoDropZone.classList.add('dragover');
    });

    logoDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        logoDropZone.classList.remove('dragover');
    });

    logoDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        logoDropZone.classList.remove('dragover');
        handleLogoFile(e.dataTransfer.files[0]);
    });

    // (Listener Kategori)
    formTambahKategori.addEventListener('submit', (e) => {
        e.preventDefault();
        const namaKat = kategoriBaruNamaInput.value.trim().toLowerCase();
        if (namaKat === "" || namaKat === "semua") {
            showNotifikasi("Nama kategori tidak valid.", "error");
            return;
        }
        if (categories.includes(namaKat)) {
            showNotifikasi("Kategori tersebut sudah ada.", "error");
            return;
        }
        categories.push(namaKat);
        simpanKategori();
        renderDaftarKategoriAdmin();
        renderKategoriOptions(); 
        showNotifikasi(`Kategori '${namaKat}' berhasil ditambahkan!`, "sukses");
        kategoriBaruNamaInput.value = '';
    });

    daftarKategoriAdmin.addEventListener('click', (e) => {
        const target = e.target.closest('.btn-hapus-kategori');
        if (target) {
            const kategoriNama = target.dataset.kategori;
            const produkTerkait = allProducts.some(p => p.kategori === kategoriNama);
            if (produkTerkait) {
                showNotifikasi("Tidak bisa menghapus: Kategori masih digunakan oleh produk.", "error");
                return;
            }
            categories = categories.filter(c => c !== kategoriNama);
            simpanKategori();
            renderDaftarKategoriAdmin();
            renderKategoriOptions(); 
            showNotifikasi(`Kategori '${kategoriNama}' berhasil dihapus.`, "sukses");
        }
    });

    // --- EVENT LISTENER (HALAMAN PEMBUKUAN) ---
    btnHitungLabaBersih.addEventListener('click', () => {
        const biayaOperasional = parseFloat(biayaOperasionalInput.value) || 0;
        const labaBersih = labaKotorGlobal - biayaOperasional;
        labaBersihDisplay.textContent = formatRupiah(labaBersih);
    });

    // --- Event Listener Setup Modal ---
    setupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        namaToko = setupNamaTokoInput.value.trim() || "Toko Sejahtera";
        simpanNamaToko(); 
        
        const file = setupLogoFileInput.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024 || !file.type.startsWith('image/')) {
                alert("File logo tidak valid (Maks 2MB, harus gambar). Silakan refresh.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                logoDataUrl = reader.result;
                simpanLogo(); 
                selesaikanSetup(); 
            };
            reader.readAsDataURL(file);
        } else {
            selesaikanSetup(); 
        }
    });

    // --- FUNGSI HELPER untuk setup ---
    const selesaikanSetup = () => {
        setSetupComplete(); 
        setupModal.classList.add('hidden'); 
        initApp(); 
    }

    // === INISIALISASI APLIKASI (LOGIKA UTAMA) ===
    muatData();
    const setupComplete = localStorage.getItem('kasir_setupComplete');
    
    if (setupComplete === 'true') {
        setupModal.classList.add('hidden');
        initApp();
    } else {
        setupModal.classList.remove('hidden');
    }
    
    renderKeranjang();
});
