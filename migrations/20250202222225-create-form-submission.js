 async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('form_submissions', {
      id: {
        type: Sequelize.TEXT, 
        primaryKey: true,
        allowNull: false,
      },
      form_id: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      values: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      submitted_by_id: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      serial_number: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    });
  }
  
   async function down(queryInterface) {
    await queryInterface.dropTable('form_submissions');
  }
  module.exports = {up, down}
