 async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('key_results', {
      id: {
        type: Sequelize.TEXT,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      category: {
        type: Sequelize.ENUM('Standard', 'Stretch', 'Binary', 'Assignment'),
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('Number', 'Percentage', 'Currency', 'Binary', 'Assignment'),
        allowNull: true,
      },
      start_value: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      current_value: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      target_value: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      daily_target: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      stretch_levels: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      binary_labels: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      assigned_task_ids: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), 
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  }
  
   async function down(queryInterface, Sequelize) {
    await queryInterface.dropTable('key_results');
  
    // 🧹 Clean up ENUM types (important for PostgreSQL)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_key_results_category";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_key_results_type";');
  }

  module.exports = {up, down}

  