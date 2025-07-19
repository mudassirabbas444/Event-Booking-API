const { admin } = require('../services/firebase');

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node scripts/setAdmin.js <uid>');
  process.exit(1);
}

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`User ${uid} is now an admin.`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error setting admin claim:', err.message);
    process.exit(1);
  }); 