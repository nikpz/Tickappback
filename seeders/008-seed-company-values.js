'use strict';

// const { MOCK_COMPANY_VISION } = require('../mockData.js');
const db = require('../models');
const {sequelize} = require('../models');



const up = async () => {
  await sequelize.sync();
  // Find the existing vision (assuming only one)
  // const vision = await db.models.CompanyVision.findOne();

  // if (!vision) {
  //   console.log('⚠️ No CompanyVision found, skipping CompanyValue seeding.');
  //   return;
  // }

  // const values = MOCK_COMPANY_VISION.values.map(v => ({
  //   id: v.id,
  //   company_vision_id: vision.id,
  //   text: v.text,
  //   icon: v.icon,
  //   color: v.color,
  // }));

  // await db.models.CompanyValue.bulkCreate(values, { ignoreDuplicates: true });

  // console.log(`✅ ${values.length} CompanyValues seeded.`);
  console.log(`✅ CompanyValues seeded.`);
};



const down = async () => {
  await db.models.CompanyValue.destroy({ where: {} });
  console.log('🧹 CompanyValues cleared.');
};

module.exports = {up, down}
