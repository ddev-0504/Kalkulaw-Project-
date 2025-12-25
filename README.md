# 🧮 KalkuLaw - Manajemen Proyek

**Anggota Kelompok**:
* Devika Widya Vania (103102400044) 
* Zalsabila Rezky Amelia Arep (103102400043) 
* Sofia (103102400039) 
* Nurul Firdasari Setyawan (103102400005)


**KalkuLaw** adalah aplikasi kalkulator inovatif yang dirancang khusus untuk perlindungan diri. Dibalik fungsinya sebagai kalkulator biasa, aplikasi ini menyimpan fitur darurat (Emergency) dan manajemen barang bukti untuk membantu korban kekerasan atau situasi darurat lainnya secara tersamar.

## Fitur Unggulan
- **Kalkulator Berfungsi Penuh:** Dapat digunakan untuk perhitungan matematika biasa agar tidak mencurigakan.
- **Stealth Dashboard:** Akses folder rahasia melalui kode unik di kalkulator.
- **Emergency Call 110:** Pemicu cepat untuk bantuan darurat.
- **Evidence Management:** Mengambil foto/video secara diam-diam dan menyimpannya di dalam database lokal (IndexedDB) yang tidak muncul di galeri HP biasa.
- **Premium Features:** Termasuk AI Document Generator dan Chatbot Assistant untuk bantuan hukum.

## Teknologi yang Digunakan
- **HTML5:** Struktur aplikasi dan komponen multimedia.
- **CSS3:** Desain modern dengan sistem *Dark/Light Mode*.
- **JavaScript (Vanilla):** Logika kalkulator, manajemen database lokal, dan pengoperasian kamera.
- **IndexedDB:** Penyimpanan bukti yang aman di sisi klien (browser).

## Struktur File
```
Kalkulaw
├── `index.html`: Halaman utama aplikasi.             
├── `style.css`: File styling untuk tampilan antarmuka.         
├── `script.js`: Seluruh logika fitur stealth dan emergency.        
├── `Laporan Manajemen Proyek` : File Project (Dokumen Perencanaan Proyek).                       
├── `test-video.html`: Alat pengujian untuk memastikan fitur kamera berjalan di browser.
├── CARA-LIHAT-VIDE0.md                                     
└── README.md
```         
- `index.html`: Halaman utama aplikasi.
- `style.css`: File styling untuk tampilan antarmuka.
- `script.js`: Seluruh logika fitur stealth dan emergency.
- `KALKULAW_merged.pdf`: Dokumentasi Project Charter (Perencanaan Proyek).
- `test-video.html`: Alat pengujian untuk memastikan fitur kamera berjalan di browser.

## Cara Penggunaan (Mode Rahasia)
1. Buka aplikasi (tampilan awal adalah kalkulator).
2. Ketik **505[PIN]=** (Contoh: `505123=`) untuk masuk ke dashboard rahasia.
3. Ketik **110=** untuk mengaktifkan mode darurat.
4. Klik logo KalkuLaw sebanyak **5 kali** untuk masuk ke menu Admin Login.

## ⚠️ Catatan Penting
Aplikasi ini memerlukan izin **Kamera** dan **Mikrofon** untuk fitur perekaman bukti. Pastikan Anda memberikan izin pada browser saat diminta atau baca file `CARA-LIHAT-VIDEO.md` jika mengalami kendala teknis.

---

### Cara Menjalankan Program

Aplikasi ini berbasis web (HTML/JS), jadi **tidak perlu instalasi rumit** atau tambahan aplikasi lain. Cukup ikuti langkah di bawah ini:

#### 1. Melalui Browser (Paling Mudah)

1. Download atau Clone repositori ini ke komputer Anda.
2. Buka folder `kalkulawfix`.
3. Klik kanan pada file **`index.html`**, lalu pilih **Open With** > > pilih browser favorit Anda (Google Chrome, Microsoft Edge, atau Firefox).
4. Aplikasi akan langsung terbuka dan berjalan.

#### 2. Melalui Terminal / Command Line

Jika Anda terbiasa menggunakan terminal, Anda bisa menjalankan perintah berikut:

```bash
# Clone repository
git clone https://github.com/ddev-0504/Kalkulaw-Project-.git

# Masuk ke folder
cd Kalkulaw-Project-

# Buka di browser (Windows)
start index.html

# Buka di browser (Mac)
open index.html

```
#### 3. Melalui Link Online (Paling Direkomendasikan)

Cukup klik link berikut untuk membuka aplikasi langsung di browser Anda: https://ddev-0504.github.io/Kalkulaw-Project-/

---

*Proyek ini dikembangkan untuk tujuan keamanan personal dan bantuan hukum.*
