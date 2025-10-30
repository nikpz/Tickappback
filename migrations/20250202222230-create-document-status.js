 async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('document_statuses', { 
      id: {
        type: Sequelize.TEXT,
        primaryKey: true,
        allowNull: false,
      },
      label: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      color: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      text_color: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    });
  }
  
   async function down(queryInterface) {
    await queryInterface.dropTable('document_statuses');
  }
  module.exports = {up, down}
