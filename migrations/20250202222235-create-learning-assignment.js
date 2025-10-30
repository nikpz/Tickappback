 async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("learning_assignments", {
    id: {
      type: Sequelize.TEXT,
      primaryKey: true,
      allowNull: false,
    },
    assignee_id: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    assigner_id: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    resource_id: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    resource_type: {
      type: Sequelize.ENUM("BOOK", "MICRO_LEARNING"),
      allowNull: false,
    },
    assigned_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("ASSIGNED", "COMPLETED"),
      allowNull: false,
    },
    completed_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    trigger_objective_id: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    trigger_feedback_id: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  });
}

 async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("learning_assignments");

  // 🧹 Clean up ENUM types for PostgreSQL
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_learning_assignments_resource_type";'
  );
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_learning_assignments_status";'
  );
}
module.exports = {up, down}
