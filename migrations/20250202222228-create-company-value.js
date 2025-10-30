"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("company_values", {
      id: { type: Sequelize.TEXT, primaryKey: true }, 
      company_vision_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "company_visions",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      text: { type: Sequelize.TEXT, allowNull: false },
      icon: { type: Sequelize.TEXT, allowNull: true },
      color: { type: Sequelize.TEXT, allowNull: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("company_values");
  },
};
