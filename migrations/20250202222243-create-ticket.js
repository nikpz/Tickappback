 async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("tickets", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    status: {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: "open",
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      // If you have a Users table, uncomment:
      // references: { model: 'users', key: 'id' },
      // onUpdate: 'CASCADE',
      // onDelete: 'CASCADE',
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
  await queryInterface.dropTable("tickets");
}

module.exports = {up, down}

