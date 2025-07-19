const express = require('express');
const router = express.Router();
const { db, admin } = require('../services/firebase');
const { verifyFirebaseToken } = require('../middleware/auth');

// POST /events/:id/rsvp
router.post('/events/:id/rsvp', verifyFirebaseToken, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.uid;
  const eventRef = db.collection('events').doc(eventId);
  const attendeeRef = eventRef.collection('attendees').doc(userId);

  try {
    await db.runTransaction(async (t) => {
      const eventDoc = await t.get(eventRef);
      if (!eventDoc.exists) throw new Error('Event not found');
      const data = eventDoc.data();
      if (data.seatsBooked >= data.capacity) throw new Error('Event full');
      const attendeeDoc = await t.get(attendeeRef);
      if (attendeeDoc.exists) throw new Error('Already RSVPed');
      t.update(eventRef, { seatsBooked: data.seatsBooked + 1 });
      t.set(attendeeRef, { userId, timestamp: admin.firestore.FieldValue.serverTimestamp() });
    });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /events/:id/rsvp
router.delete('/events/:id/rsvp', verifyFirebaseToken, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.uid;
  const eventRef = db.collection('events').doc(eventId);
  const attendeeRef = eventRef.collection('attendees').doc(userId);

  try {
    await db.runTransaction(async (t) => {
      const eventDoc = await t.get(eventRef);
      if (!eventDoc.exists) throw new Error('Event not found');
      const data = eventDoc.data();
      const attendeeDoc = await t.get(attendeeRef);
      if (!attendeeDoc.exists) throw new Error('Not RSVPed');
      t.update(eventRef, { seatsBooked: Math.max(0, data.seatsBooked - 1) });
      t.delete(attendeeRef);
    });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /my-events
router.get('/my-events', verifyFirebaseToken, async (req, res) => {
  const userId = req.user.uid;
  try {
    const eventsSnapshot = await db.collection('events').get();
    const events = [];
    for (const doc of eventsSnapshot.docs) {
      const attendeeDoc = await db.collection('events').doc(doc.id).collection('attendees').doc(userId).get();
      if (attendeeDoc.exists) {
        events.push(doc.data());
      }
    }
    res.json(events);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 