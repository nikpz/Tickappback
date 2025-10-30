'use strict';

const { MOCK_STRATEGIES } = require('../mockData.js');
const {sequelize} = require('../models');

module.exports = {

  async up(queryInterface, Sequelize) {
    await sequelize.sync();

    // const strategies = MOCK_STRATEGIES.map(s => ({
    //   id: s.id,
    //   name: s.name,
    //   description: s.description,
    //   icon: s.icon,
    //   owner_ids: s.ownerIds,
    //   category: s.category,
    //   status: s.status,
    //   start_date: s.startDate ? new Date(s.startDate) : null,
    //   end_date: s.endDate ? new Date(s.endDate) : null,
    //   swot: s.swot || {},
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // }));

    // await queryInterface.bulkInsert('strategies', strategies, {});
    // console.log(`✅ Seeded ${strategies.length} strategies`);
    console.log(`✅ Seeded strategies`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('strategies', null, {});
    console.log('🧹 Strategies cleared.');
  },
};
