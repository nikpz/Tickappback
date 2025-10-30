 async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('documents', {
      id: {
        type: Sequelize.TEXT, 
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      icon: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      content: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      font_family: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      font_size: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      last_updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  }
  
   async function down(queryInterface) {
    await queryInterface.dropTable('documents');
  }

  module.exports = {up, down}

  