// const { MOCK_OBJECTIVES, MOCK_PROJECTS, MOCK_TASKS } = require('../mockData.js');
const db = require('../models/index.js');
const {sequelize} = require('../models');

const up = async () => {
  await sequelize.sync();
  // await db.models.Objective.bulkCreate(MOCK_OBJECTIVES, { ignoreDuplicates: true });
  // await db.models.Project.bulkCreate(MOCK_PROJECTS, { ignoreDuplicates: true });
  // await db.models.Task.bulkCreate(MOCK_TASKS, { ignoreDuplicates: true });
  console.log('✅ Objectives, Projects, Tasks seeded.');
};


const down = async () => {
  await db.models.Objective.destroy({ where: {} });
  await db.models.Project.destroy({ where: {} });
  await db.models.Task.destroy({ where: {} });

  console.log('🧹 Objectives, Projects, Tasks cleared.');
};

module.exports = {up, down}

