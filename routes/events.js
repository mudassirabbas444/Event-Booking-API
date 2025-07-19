const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const { verifyFirebaseToken, isAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// POST /events (admin only)
router.post('/', [
  verifyFirebaseToken, isAdmin,
  body('title').isString().isLength({ min: 2 }).withMessage('Title min 2 chars'),
  body('description').isString().isLength({ min: 5 }).withMessage('Description min 5 chars'),
  body('location').isString().withMessage('Location required'),
  body('date').isISO8601().withMessage('Date must be ISO8601'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity min 1'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { title, description, location, date, capacity } = req.body;
  try {
    const eventRef = db.collection('events').doc();
    await eventRef.set({
      id: eventRef.id,
      title,
      description,
      location,
      date,
      capacity,
      seatsBooked: 0,
      createdBy: req.user.uid,
    });
    res.status(201).json({ id: eventRef.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /events/:id (admin only)
router.put('/:id', [
  verifyFirebaseToken, isAdmin,
  body('title').optional().isString().isLength({ min: 2 }).withMessage('Title min 2 chars'),
  body('description').optional().isString().isLength({ min: 5 }).withMessage('Description min 5 chars'),
  body('location').optional().isString().withMessage('Location required'),
  body('date').optional().isISO8601().withMessage('Date must be ISO8601'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity min 1'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id } = req.params;
  const update = req.body;
  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  try {
    await db.collection('events').doc(id).update(update);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /events/:id (admin only)
router.delete('/:id', verifyFirebaseToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection('events').doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /events (public)
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('events').get();
    const events = snapshot.docs.map(doc => doc.data());
    res.json(events);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /events/:id (public)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection('events').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Event not found' });
    res.json(doc.data());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 