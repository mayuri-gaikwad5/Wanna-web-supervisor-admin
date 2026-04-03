const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * POST /events/resolve/:eventId
 * Resolve an event (user clicked "I'm safe")
 * Moves event from ongoingEvents to pastEvents with all acceptor data
 */
router.post('/resolve/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const now = admin.firestore.Timestamp.now();

    console.log(`🔄 Resolving event: ${eventId}`);

    // 1. Get the event from ongoingEvents
    const ongoingEventRef = db.collection('ongoingEvents').doc(eventId);
    const ongoingEventDoc = await ongoingEventRef.get();

    if (!ongoingEventDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found in ongoingEvents' 
      });
    }

    const eventData = ongoingEventDoc.data();

    // 2. Get acceptors from acceptedEvents
    const acceptedEventRef = db.collection('acceptedEvents').doc(eventId);
    const acceptorsSnapshot = await acceptedEventRef.collection('acceptors').get();

    console.log(`  👥 Found ${acceptorsSnapshot.size} acceptors for event ${eventId}`);

    // 3. Create batch operation
    const batch = db.batch();

    // Move event to pastEvents
    const pastEventRef = db.collection('pastEvents').doc(eventId);
    batch.set(pastEventRef, {
      ...eventData,
      is_resolved: true,
      resolved_at: now,
      resolved_reason: 'User clicked I\'m safe',
      auto_resolved: false
    });

    // Copy acceptors to pastEvents
    if (!acceptorsSnapshot.empty) {
      for (const acceptorDoc of acceptorsSnapshot.docs) {
        const acceptorData = acceptorDoc.data();
        const pastAcceptorRef = pastEventRef.collection('acceptors').doc(acceptorDoc.id);
        
        batch.set(pastAcceptorRef, {
          ...acceptorData,
          archived_at: now,
          archived_reason: 'Event resolved by user'
        });

        // Delete acceptor from acceptedEvents
        batch.delete(acceptorDoc.ref);
      }

      // Delete parent acceptedEvents document
      batch.delete(acceptedEventRef);
    }

    // Delete from ongoingEvents
    batch.delete(ongoingEventRef);

    // Commit all changes
    await batch.commit();

    console.log(`✅ Successfully resolved event ${eventId}`);

    res.json({
      success: true,
      message: 'Event resolved successfully',
      eventId: eventId,
      acceptorsArchived: acceptorsSnapshot.size
    });

  } catch (error) {
    console.error('❌ Error resolving event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve event',
      error: error.message
    });
  }
});

module.exports = router;
