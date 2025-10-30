async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('form_categories', {
      id: {
        type: Sequelize.TEXT,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      color: {
        type: Sequelize.TEXT,
        allowNull: false,
      }, 
    });
  }
  
  async function down(queryInterface) {
    await queryInterface.dropTable('form_categories');
  }

  module.exports = {up, down}
  