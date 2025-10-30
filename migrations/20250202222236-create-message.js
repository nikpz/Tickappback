 async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("messages", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      // If you have a Users table, uncomment:
      // references: { model: 'users', key: 'id' },
      // onUpdate: 'CASCADE',
      // onDelete: 'CASCADE',
    },
    ticketId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      // If you have a Tickets table, uncomment:
      // references: { model: 'tickets', key: 'id' },
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
  await queryInterface.dropTable("messages");
}

module.exports = {up, down}

