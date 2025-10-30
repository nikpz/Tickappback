 async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('micro_learnings', {
      id: {
        type: Sequelize.TEXT,
        primaryKey: true,
        allowNull: false,
      },
      topic: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      generated_text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      quiz: {
        type: Sequelize.JSONB,
        allowNull: true,
      }, 
    });
  }
  
   async function down(queryInterface) {
    await queryInterface.dropTable('micro_learnings');
  }
  module.exports = {up, down}
