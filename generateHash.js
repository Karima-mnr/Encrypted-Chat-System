// generateHash.js
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'kali';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('==========================================');
  console.log('🔐 BCRYPT HASH GENERATOR');
  console.log('==========================================');
  console.log('Password:', password);
  console.log('NEW HASH:', hash);
  console.log('Hash length:', hash.length);
  console.log('==========================================');
  
  // Verify it works
  const verify = await bcrypt.compare(password, hash);
  console.log('Verification test:', verify ? '✅ SUCCESS' : '❌ FAILED');
  console.log('==========================================');
}

generateHash();