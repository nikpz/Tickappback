 async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("tasks", {
    id: {
      type: Sequelize.TEXT,
      primaryKey: true,
      allowNull: false,
    },
    icon: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    status: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    recurrence: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
    custom_fields: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
    monitoring: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
    numeric_value: {
      type: Sequelize.DOUBLE,
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
}

 async function down(queryInterface) {
  await queryInterface.dropTable("tasks");
}
module.exports = {up, down}
