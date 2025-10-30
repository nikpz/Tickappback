// const { MOCK_USERS, MOCK_TEAMS } = require('../mockData.js');
const {sequelize} = require('../models');
const db = require('../models');
console.log('Object.keys(db.models) is: ', Object.keys(db.models.Team))

const up = async () => {
  await sequelize.sync();
  // await db.models.User.bulkCreate(MOCK_USERS, { ignoreDuplicates: true });
  // await db.models.Team.bulkCreate(MOCK_TEAMS, { ignoreDuplicates: true });
  console.log('✅ Users and Teams seeded successfully.');
};

const down = async () => {
  await db.models.User.destroy({ where: {} });
  await db.models.Team.destroy({ where: {} });
  console.log('🧹 Users and Teams cleared.');
};
module.exports = {up, down}

/*
const { sequelize, models } = require('./models');
const bcrypt = require('bcrypt');

const MOCK_USERS = [
  { id: 'u1', name: 'آرش مدیر', username: 'admin', password: 'admin', role: 'admin', teamId: 't1', avatarUrl: 'https://i.pravatar.cc/150?u=u1', signatureUrl: '' },
  { id: 'u2', name: 'سارا رهبر', username: 'lead', password: '123', role: 'lead', teamId: 't1', avatarUrl: 'https://i.pravatar.cc/150?u=u2', signatureUrl: '' },
  { id: 'u3', name: 'علی عضو', username: 'member', password: '123', role: 'member', teamId: 't1', avatarUrl: 'https://i.pravatar.cc/150?u=u3', signatureUrl: '' },
  { id: 'u4', name: 'مریم عضو', username: 'member2', password: '123', role: 'member', teamId: 't1', avatarUrl: 'https://i.pravatar.cc/150?u=u4', signatureUrl: '' },
];

const MOCK_TEAMS = [
  { id: 't1', name: 'تیم محصول', leadId: 'u2', memberIds: ['u1', 'u3', 'u4'], icon: 'CubeIcon', category: 'محصول' },
];

async function seedUsersAndTeams() {
  // Create Teams
  for (const t of MOCK_TEAMS) {
    await models.Team.create({
      id: t.id,
      name: t.name,
      leadId: t.leadId,
      icon: t.icon,
      category: t.category,
    });
  }

  // Create Users
  for (const u of MOCK_USERS) {
    const hash = await bcrypt.hash(u.password, 10);
    await models.User.create({
      id: u.id,
      name: u.name,
      username: u.username,
      passwordHash: hash,
      role: u.role,
      teamId: u.teamId,
      avatarUrl: u.avatarUrl,
      signatureUrl: u.signatureUrl,
    });
  }
}

module.exports = { seedUsersAndTeams };

*/