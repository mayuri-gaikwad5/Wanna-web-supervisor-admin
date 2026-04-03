const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * Cleanup script to automatically resolve ongoing events older than 24 hours
 * This prevents old test events from cluttering the supervisor dashboard
 */

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

async function cleanupOldEvents() {
  console.log('🧹 Starting cleanup of old events...');
  
  try {
    const now = admin.firestore.Timestamp.now();
    const twentyFourHoursAgo = admin.firestore.Timestamp.fromMillis(
      now.toMillis() - TWENTY_FOUR_HOURS_MS
    );

    // Get all ongoing events older than 24 hours
    const ongoingEventsRef = db.collection('ongoingEvents');
    
    let oldEventsSnapshot;
    try {
      // Try with composite index query
      oldEventsSnapshot = await ongoingEventsRef
        .where('is_resolved', '==', false)
        .where('timestamp', '<=', twentyFourHoursAgo)
        .get();
    } catch (indexError) {
      if (indexError.code === 9) {
        console.log('⚠️  Firestore index not ready. Using fallback method...');
        console.log('📋 Please create the index using the link in FIRESTORE_INDEX_SETUP.md');
        
        // Fallback: Get all unresolved events and filter in memory
        const allUnresolvedSnapshot = await ongoingEventsRef
          .where('is_resolved', '==', false)
          .get();
        
        const oldDocs = allUnresolvedSnapshot.docs.filter(doc => {
          const timestamp = doc.data().timestamp;
          return timestamp && timestamp.toMillis() <= twentyFourHoursAgo.toMillis();
        });
        
        // Create a mock snapshot object
        oldEventsSnapshot = {
          empty: oldDocs.length === 0,
          size: oldDocs.length,
          docs: oldDocs
        };
      } else {
        throw indexError;
      }
    }

    if (oldEventsSnapshot.empty) {
      console.log('✅ No old events to clean up');
      return { cleaned: 0, message: 'No old events found' };
    }

    console.log(`📋 Found ${oldEventsSnapshot.size} old events to clean up`);

    const batch = db.batch();
    let cleanedCount = 0;

    for (const eventDoc of oldEventsSnapshot.docs) {
      const eventData = eventDoc.data();
      const eventId = eventDoc.id;

      console.log(`🔄 Processing event: ${eventId}`);

      // 1. Move to past events
      const pastEventRef = db.collection('pastEvents').doc(eventId);
      batch.set(pastEventRef, {
        ...eventData,
        is_resolved: true,
        resolved_at: now,
        resolved_reason: 'Auto-resolved after 24 hours',
        auto_resolved: true
      });

      // 2. Check if there are acceptors for this event
      const acceptedEventRef = db.collection('acceptedEvents').doc(eventId);
      const acceptorsSnapshot = await acceptedEventRef.collection('acceptors').get();

      if (!acceptorsSnapshot.empty) {
        console.log(`  👥 Found ${acceptorsSnapshot.size} acceptors for event ${eventId}`);
        
        // Archive acceptors to past events
        for (const acceptorDoc of acceptorsSnapshot.docs) {
          const acceptorData = acceptorDoc.data();
          const pastAcceptorRef = pastEventRef.collection('acceptors').doc(acceptorDoc.id);
          
          batch.set(pastAcceptorRef, {
            ...acceptorData,
            archived_at: now,
            archived_reason: 'Event auto-resolved after 24 hours'
          });

          // Delete acceptor from acceptedEvents
          batch.delete(acceptorDoc.ref);
        }

        // Delete the parent acceptedEvents document
        batch.delete(acceptedEventRef);
      }

      // 3. Delete from ongoingEvents collection
      batch.delete(eventDoc.ref);

      cleanedCount++;
    }

    // Commit all changes
    await batch.commit();

    console.log(`✅ Successfully cleaned up ${cleanedCount} old events`);
    return { 
      cleaned: cleanedCount, 
      message: `Cleaned up ${cleanedCount} events older than 24 hours` 
    };

  } catch (error) {
    console.error('❌ Error cleaning up old events:', error);
    throw error;
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupOldEvents()
    .then((result) => {
      console.log('✅ Cleanup completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupOldEvents };
