const { admin } = require('../services/firebase');

async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function isAdmin(req, res, next) {
  if (req.user && req.user.admin === true) {
    return next();
  }
  return res.status(403).json({ error: 'Admin only' });
}

module.exports = { verifyFirebaseToken, isAdmin }; 