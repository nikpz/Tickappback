"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("strategies", {
      id: { type: Sequelize.TEXT, allowNull: false, primaryKey: true },
      name: { type: Sequelize.TEXT, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      icon: { type: Sequelize.TEXT, allowNull: true },
      owner_ids: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
        defaultValue: [],
      },
      category: { type: Sequelize.TEXT, allowNull: true },
      status: { type: Sequelize.TEXT, allowNull: true },
      start_date: { type: Sequelize.DATE, allowNull: true },
      end_date: { type: Sequelize.DATE, allowNull: true },
      swot: { type: Sequelize.JSONB, allowNull: true },
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("strategies");
  },
};
