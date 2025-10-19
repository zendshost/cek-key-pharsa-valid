# Pi Phrase Validator | Pengecek Mnemonic Pi Network

![Node.js](https://img.shields.io/badge/Node.js-14.x+-green?style=for-the-badge&logo=node.js)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)

**Pi Phrase Validator** adalah sebuah skrip otomatis yang dirancang untuk memvalidasi daftar *mnemonic phrase* (frasa mnemonik) 24-kata dan memeriksa apakah frasa tersebut terdaftar sebagai akun aktif di blockchain Pi Network. Alat ini sangat berguna bagi mereka yang perlu memverifikasi sejumlah besar frasa mnemonik secara efisien.

Hasil validasi akan secara otomatis dikirimkan ke Telegram Anda, memberikan notifikasi *real-time* untuk setiap frasa yang valid dan terdaftar.

---

## 📜 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [⚠️ Peringatan Keamanan Penting](#️-peringatan-keamanan-penting)
- [⚙️ Bagaimana Cara Kerjanya?](#️-bagaimana-cara-kerjanya)
- [🛠️ Prasyarat Sistem](#️-prasyarat-sistem)
- [🚀 Panduan Instalasi dan Penggunaan](#-panduan-instalasi-dan-penggunaan)
  - [Langkah 1: Unduh Kode Proyek](#langkah-1-unduh-kode-proyek)
  - [Langkah 2: Instal Dependensi](#langkah-2-instal-dependensi)
  - [Langkah 3: Siapkan File Mnemonic (`pharses.txt`)](#langkah-3-siapkan-file-mnemonic-pharsestxt)
  - [Langkah 4: Konfigurasi Notifikasi Telegram](#langkah-4-konfigurasi-notifikasi-telegram)
  - [Langkah 5: Jalankan Skrip](#langkah-5-jalankan-skrip)
- [📄 Memahami Hasil](#-memahami-hasil)
- [🔧 Troubleshooting (Penyelesaian Masalah)](#-troubleshooting-penyelesaian-masalah)
- [🤝 Kontribusi](#-kontribusi)
- [📞 Kontak Developer](#-kontak-developer)
- [📄 Lisensi](#-lisensi)

---

## ✨ Fitur Utama

- **Validasi Massal**: Cek ratusan atau ribuan *mnemonic phrase* dari satu file.
- **Notifikasi Real-time**: Dapatkan pemberitahuan instan di Telegram untuk setiap *mnemonic phrase* yang valid dan terdaftar di jaringan Pi.
- **Penyortiran Otomatis**: Hasil pengecekan secara otomatis dipisahkan ke dalam file `valid.txt` dan `invalid.txt`.
- **Derivasi Path Pi Network**: Menggunakan path derivasi standar Pi Network (`m/44'/314159'/0'`) untuk memastikan kompatibilitas.
- **Penanganan Rate Limit**: Dilengkapi dengan jeda antar permintaan untuk menghindari pemblokiran dari API server Pi dan Telegram.
- **Logging Jelas**: Tampilan log di konsol yang informatif untuk memantau proses pengecekan.

---

## ⚠️ Peringatan Keamanan Penting

> **PERHATIAN:** *Mnemonic phrase* adalah kunci utama untuk mengakses aset kripto Anda. Jangan pernah membagikan frasa ini kepada siapa pun. Alat ini dirancang untuk dijalankan secara lokal di komputer Anda sendiri.
> - **JANGAN** menjalankan skrip ini di layanan cloud, server online, atau komputer yang tidak Anda percayai sepenuhnya.
> - **JANGAN** membagikan file `pharses.txt`, `valid.txt`, atau token bot Telegram Anda.
> - **Developer tidak bertanggung jawab** atas kehilangan aset yang disebabkan oleh penyalahgunaan atau kelalaian dalam menjaga keamanan *mnemonic phrase* Anda. Gunakan dengan risiko Anda sendiri.

---

## ⚙️ Bagaimana Cara Kerjanya?

Skrip ini bekerja melalui beberapa langkah teknis:

1.  **Membaca Input**: Skrip membaca file `pharses.txt` dan memuat semua baris yang berisi 24 kata ke dalam memori.
2.  **Derivasi Kunci**: Untuk setiap *mnemonic phrase*, skrip menggunakan library `bip39` dan `ed25519-hd-key` untuk menghasilkan *seed*. Dari *seed* ini, skrip menghasilkan *keypair* (kunci publik dan privat) menggunakan path derivasi spesifik untuk Pi Network: `m/44'/314159'/0'`.
3.  **Koneksi ke Server Pi**: Skrip terhubung ke server mainnet Pi Network (`https://api.mainnet.minepi.com`) menggunakan `stellar-sdk`.
4.  **Validasi Akun**: Skrip mencoba memuat data akun menggunakan kunci publik yang telah dihasilkan (`server.loadAccount(publicKey)`).
    -   Jika **berhasil** (akun ditemukan), *mnemonic phrase* dianggap **VALID** dan terdaftar.
    -   Jika server mengembalikan status **404 Not Found**, akun tidak ditemukan. *Mnemonic phrase* dianggap **TIDAK TERDAFTAR**.
5.  **Pencatatan & Notifikasi**: Frasa yang valid disimpan di `valid.txt` dan notifikasi dikirim ke Telegram. Frasa yang tidak terdaftar disimpan di `invalid.txt`.
6.  **Jeda (Delay)**: Setelah setiap pengecekan, skrip akan berhenti selama 2 detik (2000 ms) untuk mengurangi beban pada server Pi dan API Telegram.

---

## 🛠️ Prasyarat Sistem

Sebelum memulai, pastikan perangkat lunak berikut sudah terinstal di komputer Anda:

- [**Node.js**](https://nodejs.org/) (disarankan versi 14.x atau lebih baru).
- [**Git**](https://git-scm.com/) (untuk mengunduh kode dari GitHub).

---

## 🚀 Panduan Instalasi dan Penggunaan

Ikuti langkah-langkah berikut untuk menyiapkan dan menjalankan skrip dari awal hingga akhir.

### Langkah 1: Unduh Kode Proyek

Buka Terminal (atau Command Prompt) Anda dan jalankan perintah berikut untuk mengunduh kode proyek:

```bash
git clone https://github.com/zendshost/cek-key-pharsa-valid.git
