const { cleanupOldEvents } = require('../scripts/cleanupOldEvents');

/**
 * Scheduled job to run event cleanup periodically
 * Runs every hour to check for events older than 24 hours
 */

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Run every 1 hour

let cleanupInterval = null;

function startEventCleanupJob() {
  console.log('🚀 Starting event cleanup job (runs every hour)');

  // Run immediately on startup
  cleanupOldEvents()
    .then((result) => {
      console.log('✅ Initial cleanup completed:', result);
    })
    .catch((error) => {
      console.error('❌ Initial cleanup failed:', error);
    });

  // Schedule recurring cleanup
  cleanupInterval = setInterval(async () => {
    console.log('⏰ Running scheduled event cleanup...');
    try {
      const result = await cleanupOldEvents();
      console.log('✅ Scheduled cleanup completed:', result);
    } catch (error) {
      console.error('❌ Scheduled cleanup failed:', error);
    }
  }, CLEANUP_INTERVAL_MS);

  console.log('✅ Event cleanup job started successfully');
}

function stopEventCleanupJob() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('🛑 Event cleanup job stopped');
  }
}

module.exports = {
  startEventCleanupJob,
  stopEventCleanupJob
};
