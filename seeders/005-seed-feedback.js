// const { MOCK_FEEDBACK_TAGS, MOCK_CHALLENGE_TAGS } = require('../mockData.js');
const db = require('../models');
const {sequelize} = require('../models');

const up = async () => {
  await sequelize.sync();
  // await db.models.FeedbackTag.bulkCreate([...MOCK_FEEDBACK_TAGS, ...MOCK_CHALLENGE_TAGS], { ignoreDuplicates: true });
  console.log('✅ Feedback Tags seeded.');
};



const down = async () => {
  await db.models.FeedbackTag.destroy({ where: {} });
  console.log('🧹 Feedback Tags cleared.');
};

module.exports = {up, down}
