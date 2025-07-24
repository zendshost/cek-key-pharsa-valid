const fs = require('fs');
const bip39 = require('bip39');
const edHd = require('ed25519-hd-key');
const { Keypair, Server } = require('stellar-sdk');

const server = new Server('https://api.mainnet.minepi.com');

// Convert 24-word mnemonic to Stellar keypair
function mnemonicToStellarKeypair(mnemonic) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const { key } = edHd.derivePath("m/44'/314159'/0'", seed); // Pi Network path
  return Keypair.fromRawEd25519Seed(key);
}

// Read and clean input
const mnemonics = fs.readFileSync('pharses.txt', 'utf8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.split(' ').length === 24); // Only 24-word mnemonics

// Prepare output files
fs.writeFileSync('valid.txt', '');
fs.writeFileSync('invalid.txt', '');

async function checkMnemonics(list) {
  for (const mnemonic of list) {
    try {
      const keypair = mnemonicToStellarKeypair(mnemonic);
      const pubkey = keypair.publicKey();

      await server.loadAccount(pubkey);
      console.log(`✅ Terdaftar: ${pubkey}`);
      fs.appendFileSync('valid.txt', mnemonic + '\n');
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
