// const {
//     MOCK_KANBAN_COLUMNS,
//     MOCK_COMPANY_VISION,
//     MOCK_STRATEGIES,
//     MOCK_INDICES
//   } = require('../mockData.js');
  const db = require('../models/index.js');
  const {sequelize} = require('../models');

  
 const up = async () => {
    await sequelize.sync();
    // await db.models.KanbanColumn.bulkCreate(MOCK_KANBAN_COLUMNS, { ignoreDuplicates: true });
    // await db.models.CompanyVision.bulkCreate(MOCK_COMPANY_VISION, { ignoreDuplicates: true });
    // await db.models.Strategy.bulkCreate(MOCK_STRATEGIES, { ignoreDuplicates: true });
    // await db.models.Index.bulkCreate(MOCK_INDICES, { ignoreDuplicates: true });
    console.log('✅ Kanban, Vision, Strategy, Indices seeded.');
  };
  
 const down = async () => {
    // await db.Index.destroy({ where: {} });
    await db.Strategy.destroy({ where: {} });
    await db.CompanyVision.destroy({ where: {} });
    await db.KanbanColumn.destroy({ where: {} });
    console.log('🧹 Kanban, Vision, Strategy, Indices cleared.');
  };
module.exports = {up, down}
