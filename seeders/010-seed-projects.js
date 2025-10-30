'use strict';

const { MOCK_PROJECTS } = require('../mockData.js');
const {sequelize} = require('../models');

module.exports = {
  async up(queryInterface, Sequelize) {
    await sequelize.sync();

    // const projects = MOCK_PROJECTS.map(p => ({
    //   id: p.id,
    //   name: p.name,
    //   objective_id: p.objectiveId,
    //   color: p.color,
    //   description: p.description,
    //   mission_statement: p.missionStatement || null,
    //   is_pinned: p.isPinned || false,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // }));

    // await queryInterface.bulkInsert('projects', projects, {});
    // console.log(`✅ Seeded ${projects.length} projects`);
    console.log(`✅ Seeded projects`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('projects', null, {});
    console.log('🧹 Projects cleared.');
  },
};
