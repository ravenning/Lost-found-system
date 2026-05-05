const cron = require('node-cron');
const Item = require('../models/Item');

// Run every day at midnight
const startArchiveService = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running archive service...');
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Archive items older than 6 months that are not already archived
      const itemsToArchive = await Item.find({
        updatedAt: { $lt: sixMonthsAgo },
        status: { $ne: 'ARCHIVED' }
      });

      let archivedCount = 0;
      for (let item of itemsToArchive) {
        if (item.transitionStatus('ARCHIVED')) {
          await item.save();
          archivedCount++;
        }
      }

      console.log(`Archived ${archivedCount} old items.`);
    } catch (error) {
      console.error('Error in archive service:', error);
    }
  });
};

module.exports = startArchiveService;
