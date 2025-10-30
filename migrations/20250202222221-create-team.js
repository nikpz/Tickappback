 async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("teams", {
    id: {
      type: Sequelize.TEXT,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    leadId: {
      type: Sequelize.TEXT,
      allowNull: false,
      // If you have a Users table, uncomment to add FK:
      // references: { model: 'users', key: 'id' },
      // onUpdate: 'CASCADE',
      // onDelete: 'SET NULL',
    },
    icon: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    category: {
      type: Sequelize.TEXT,
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
  await queryInterface.dropTable("teams");
}

module.exports = {up, down}

