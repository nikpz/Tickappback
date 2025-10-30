//Sequelize seed scripts (JavaScript, not TypeScript) is for quickly import all your MOCK_* data into PostgreSQL
//Seed Runner
const seed1 = require("../seeders/001-seed-users-teams.js");
const seed2 = require("../seeders/002-seed-kanban-strategy.js");
const seed3 = require("../seeders/003-seed-objectives-projects-tasks.js");
const seed4 = require("../seeders/004-seed-forms-documents-learning.js");
const seed5 = require("../seeders/005-seed-feedback.js");
// const seed6 = require("../seeders/006-seed-kanbanColumns.js");
const seed7 = require("../seeders/007-seed-company-vision.js");
const seed8 = require("../seeders/008-seed-company-values.js");
const seed9 = require("../seeders/009-seed-strategies.js");
const seed10 = require("../seeders/010-seed-projects.js");

// (async () => {
module.exports = async function seedAll() {
  await seed1.up();
  await seed2.up();
  await seed3.up();
  await seed4.up();
  await seed5.up();
  // await seed6.up();
  await seed7.up();
  await seed8.up();
  await seed9.up();
  await seed10.up();
  console.log("🌱 All data seeded successfully.");
};
// Optional: run automatically when executed directly
if (process.argv[1].includes("seed.js")) {
  seedAll();
}
/**
 * Each seeder file (like 001-seed-users-teams.js) can focus on one domain (Users, Teams, etc.).
 * You can run them all together in sequence.
 * You can also re-run individual seed files during development.
 */
