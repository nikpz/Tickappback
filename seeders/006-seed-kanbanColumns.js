// const { MOCK_KANBAN_COLUMNS } = require('../mockData.js');
// const db = require('../models/index.js');
// const {sequelize} = require('../models');



// const up = async () => {
//     await db.models.KanbanColumn.bulkCreate(...MOCK_KANBAN_COLUMNS, { ignoreDuplicates: true });
//     console.log('✅ KanbanColumn Tags seeded.');
// };
  


// const down = async () => {
//     await db.models.KanbanColumn.destroy({ where: {} });
//     console.log('🧹 KanbanColumn Tags cleared.');
// };

// module.exports = {up, down}


// /*
// export async function seedKanbanColumns(sequelize) {
//     const KanbanColumn = sequelize.models.KanbanColumn;
  
//     const MOCK_KANBAN_COLUMNS = [
//       { id: 'todo', title: 'برای انجام', color: 'gray', icon: 'ListBulletIcon' },
//       { id: 'in-progress', title: 'در حال پیشرفت', color: 'gray', icon: 'ClockIcon' },
//       { id: 'review', title: 'بازبینی', color: 'gray', icon: 'EyeIcon' },
//       { id: 'done', title: 'انجام شد', color: 'gray', icon: 'CheckCircleIcon' },
//     ];
  
//     for (let i = 0; i < MOCK_KANBAN_COLUMNS.length; i++) {
//       await KanbanColumn.upsert({
//         ...MOCK_KANBAN_COLUMNS[i],
//         order: i,
//       });
//     }
  
//     console.log('✅ Kanban columns seeded');
//   }

// */