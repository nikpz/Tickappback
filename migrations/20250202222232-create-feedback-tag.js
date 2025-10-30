 async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('feedback_tags', {
      id: {
        type: Sequelize.TEXT,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true, 
      },
      icon: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      color: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    });
  }
  
   async function down(queryInterface) {
    await queryInterface.dropTable('feedback_tags');
  }
  module.exports = {up, down}
