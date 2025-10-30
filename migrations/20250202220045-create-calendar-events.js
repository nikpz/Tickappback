"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("calendar_events", {
      id: {
        type: Sequelize.TEXT,
        allowNull: false,
        primaryKey: true,
      },
      title: { type: Sequelize.TEXT, allowNull: false },
      description: { type: Sequelize.TEXT },
      start: { type: Sequelize.DATE, allowNull: false },
      end: { type: Sequelize.DATE, allowNull: false },
      recurrence: {
        type: Sequelize.JSONB,
        defaultValue: { frequency: "none", interval: 1 },
      },
      color: { type: Sequelize.TEXT, defaultValue: "#4F46E5" },
      created_by: {
        type: Sequelize.TEXT,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      deleted_at: { type: Sequelize.DATE },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("calendar_events");
  },
};
