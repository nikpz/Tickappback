// const {
//     MOCK_FORM_CATEGORIES,
//     MOCK_FORMS,
//     MOCK_SUBMISSIONS,
//     MOCK_DOCUMENT_STATUSES,
//     MOCK_DOCUMENTS,
//     MOCK_MICRO_LEARNINGS,
//     MOCK_YOUTUBE_VIDEOS,
//     MOCK_BOOKS,
//     MOCK_LEARNING_ASSIGNMENTS
//   } = require('../mockData.js');
  const db = require('../models');
  const {sequelize} = require('../models');


  const up = async () => {
    await sequelize.sync({logging: console.log});
    // await db.models.FormCategory.bulkCreate(MOCK_FORM_CATEGORIES, { ignoreDuplicates: true });
    // await db.models.Form.bulkCreate(MOCK_FORMS, { ignoreDuplicates: true });
    // await db.models.FormSubmission.bulkCreate(MOCK_SUBMISSIONS, { ignoreDuplicates: true });
    // await db.models.DocumentStatus.bulkCreate(MOCK_DOCUMENT_STATUSES, { ignoreDuplicates: true });
    // await db.models.Document.bulkCreate(MOCK_DOCUMENTS, { ignoreDuplicates: true });
    // await db.models.MicroLearning.bulkCreate(MOCK_MICRO_LEARNINGS, { ignoreDuplicates: true });
    // await db.models.YouTubeVideo.bulkCreate(MOCK_YOUTUBE_VIDEOS, { ignoreDuplicates: true });
    // await db.models.Book.bulkCreate(MOCK_BOOKS, { ignoreDuplicates: true });
    // await db.models.LearningAssignment.bulkCreate(MOCK_LEARNING_ASSIGNMENTS, { ignoreDuplicates: true });
    console.log('✅ Forms, Documents, and Learning Hub seeded.');
  };
  
  
 const down = async () => {
  await sequelize.sync({logging: console.log});
    await db.models.LearningAssignment.destroy({ where: {} });
    await db.models.Book.destroy({ where: {} });
    await db.models.YouTubeVideo.destroy({ where: {} });
    await db.models.MicroLearning.destroy({ where: {} });
    await db.models.Document.destroy({ where: {} });
    await db.models.DocumentStatus.destroy({ where: {} });
    await db.models.FormSubmission.destroy({ where: {} });
    await db.models.Form.destroy({ where: {} });
    await db.models.FormCategory.destroy({ where: {} });
    console.log('🧹 Forms, Documents, Learning Hub cleared.');
  };
  module.exports = {up, down}
