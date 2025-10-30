'use strict';

// const { MOCK_COMPANY_VISION } = require('../mockData.js');
const db = require('../models');
const {sequelize} = require('../models');



const up = async () => {
  await sequelize.sync();
  // const { missionTitle, passion, skill, market, business, fiveYearVision } = MOCK_COMPANY_VISION;

  // Insert the company vision record
  // const vision = await db.models.CompanyVision.create({
  //   mission_title: missionTitle,
  //   passion,
  //   skill,
  //   market,
  //   business,
  //   five_year_vision: fiveYearVision,
  // });

  // console.log(`✅ CompanyVision seeded with id: ${vision.id}`);
  console.log(`✅ CompanyVision seeded with id: $$$$$`);
};



const down = async () => {
  await db.models.CompanyVision.destroy({ where: {} });
  console.log('🧹 CompanyVision cleared.');
};

module.exports = {up, down}
