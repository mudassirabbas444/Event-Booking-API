const express = require('express');
const router = express.Router();
const { admin } = require('../services/firebase');
const { verifyFirebaseToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// POST /signup
router.post('/signup', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('displayName').optional().isString().isLength({ min: 2 }).withMessage('displayName min 2 chars'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password, displayName } = req.body;
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });
    res.status(201).json({ uid: userRecord.uid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /me
router.get('/me', verifyFirebaseToken, async (req, res) => {
  try {
    const user = await admin.auth().getUser(req.user.uid);
    res.json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      customClaims: user.customClaims || {},
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 