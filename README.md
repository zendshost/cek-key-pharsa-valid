```markdown
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
- [🛠️ Prasyarat](#️-prasyarat)
- [🚀 Instalasi & Konfigurasi](#-instalasi--konfigurasi)
  - [Langkah 1: Clone Repositori](#langkah-1-clone-repositori)
  - [Langkah 2: Instal Dependensi](#langkah-2-instal-dependensi)
  - [Langkah 3: Siapkan Daftar Mnemonic](#langkah-3-siapkan-daftar-mnemonic)
  - [Langkah 4: Konfigurasi Notifikasi Telegram](#langkah-4-konfigurasi-notifikasi-telegram)
- [▶️ Penggunaan](#️-penggunaan)
- [📄 Memahami Hasil](#-memahami-hasil)
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
    -   Jika terjadi error lain, skrip akan mencatatnya di konsol.
5.  **Pencatatan & Notifikasi**:
    -   Frasa yang valid akan disimpan di `valid.txt` dan notifikasi dikirim ke Telegram.
    -   Frasa yang tidak terdaftar akan disimpan di `invalid.txt`.
6.  **Jeda (Delay)**: Setelah setiap pengecekan, skrip akan berhenti selama 2 detik (2000 ms) untuk mengurangi beban pada server Pi dan API Telegram, serta menghindari *rate limiting*.

---

## 🛠️ Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (disarankan versi 14.x atau lebih baru)
- npm (biasanya terinstal bersama Node.js)

---

## 🚀 Instalasi & Konfigurasi

Ikuti langkah-langkah berikut untuk menyiapkan dan menjalankan skrip.

### Langkah 1: Clone Repositori

Buka terminal atau command prompt Anda dan jalankan perintah berikut untuk mengunduh kode proyek:

```bash
git clone https://github.com/zendshost/cek-key-pharsa-valid.git
```

Setelah selesai, masuk ke direktori proyek:

```bash
cd cek-key-pharsa-valid
```

### Langkah 2: Instal Dependensi

Jalankan perintah berikut untuk menginstal semua library yang dibutuhkan oleh proyek:

```bash
npm install
```

### Langkah 3: Siapkan Daftar Mnemonic

1.  Buat sebuah file baru di dalam direktori proyek dengan nama `pharses.txt`.
2.  Isi file tersebut dengan daftar *mnemonic phrase* Anda. **Pastikan setiap frasa berada di baris baru**, seperti contoh di bawah:

    ```
    word1 word2 word3 ... word24
    another1 another2 another3 ... another24
    next1 next2 next3 ... next24
    ```

### Langkah 4: Konfigurasi Notifikasi Telegram

Anda perlu mendapatkan **Token Bot** dan **Chat ID** dari Telegram.

1.  **Dapatkan Token Bot**:
    -   Buka Telegram dan cari `@BotFather`.
    -   Kirim perintah `/newbot` dan ikuti instruksinya untuk membuat bot baru.
    -   BotFather akan memberikan Anda sebuah token API. Salin token ini.

2.  **Dapatkan Chat ID**:
    -   Cari bot `@userinfobot` di Telegram.
    -   Kirim pesan `/start` ke bot tersebut.
    -   Bot akan membalas dengan Chat ID Anda. Salin ID ini.

3.  **Masukkan ke dalam Kode**:
    -   Buka file `index.js` dengan editor teks.
    -   Cari baris berikut dan ganti `TOKEN_BOT` dan `ID_TELEGRAM` dengan nilai yang telah Anda dapatkan.

    ```javascript
    // Ganti dengan info Telegram kamu
    const TELEGRAM_BOT_TOKEN = 'TOKEN_BOT'; // <-- Ganti ini dengan token bot Anda
    const TELEGRAM_CHAT_ID = 'ID_TELEGRAM'; // <-- Ganti ini dengan Chat ID Anda
    ```

---

## ▶️ Penggunaan

Setelah semua konfigurasi selesai, jalankan skrip dari terminal Anda dengan perintah:

```bash
node index.js
```

Skrip akan mulai memproses setiap *mnemonic phrase* dari file `pharses.txt` dan menampilkan progresnya di konsol.

---

## 📄 Memahami Hasil

Setelah skrip selesai berjalan, Anda akan menemukan dua file baru di direktori proyek:

-   `valid.txt`: Berisi semua *mnemonic phrase* yang berhasil divalidasi dan terbukti terdaftar sebagai akun di jaringan Pi.
-   `invalid.txt`: Berisi semua *mnemonic phrase* yang valid secara format (24 kata) tetapi tidak terdaftar sebagai akun di jaringan Pi.

Anda juga akan menerima notifikasi di Telegram untuk setiap frasa yang ditemukan valid.

---

## 🤝 Kontribusi

Kontribusi untuk meningkatkan proyek ini sangat kami hargai! Jika Anda ingin berkontribusi:

1.  *Fork* repositori ini.
2.  Buat *branch* baru untuk fitur Anda (`git checkout -b fitur/NamaFitur`).
3.  *Commit* perubahan Anda (`git commit -m 'Menambahkan fitur baru'`).
4.  *Push* ke *branch* Anda (`git push origin fitur/NamaFitur`).
5.  Buat *Pull Request* baru.

---

## 📞 Kontak Developer

Jika Anda memiliki pertanyaan, saran, atau ingin berdiskusi, jangan ragu untuk menghubungi:

-   **Nama**: zendshost
-   **Telegram**: [@zendshost](https://t.me/zendshost)

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](LICENSE).

```
