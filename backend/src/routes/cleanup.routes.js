const express = require('express');
const router = express.Router();
const { cleanupOldEvents } = require('../scripts/cleanupOldEvents');

/**
 * Manual cleanup endpoint
 * POST /cleanup/events
 * Manually trigger cleanup of events older than 24 hours
 */
router.post('/events', async (req, res) => {
  try {
    console.log('📞 Manual cleanup triggered via API');
    const result = await cleanupOldEvents();
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Manual cleanup failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup old events',
      error: error.message
    });
  }
});

/**
 * Get cleanup status
 * GET /cleanup/status
 */
router.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Event cleanup job is running',
    interval: '1 hour',
    threshold: '24 hours'
  });
});

module.exports = router;
