// cronJob.js
const cron = require('node-cron');
const checkExpiry = require('../utilty/checkCategoryOfferExpiry'); // Adjust the path accordingly

const start = () => {
  // Schedule the cron job to run every 2 minutes
  cron.schedule('*/2 * * * *', () => {
    console.log('Running cron job for checking expiry...');
    checkExpiry();
  });
};

module.exports = { start };
