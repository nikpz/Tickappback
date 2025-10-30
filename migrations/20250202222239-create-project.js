"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("projects", {
      id: { type: Sequelize.TEXT, allowNull: false, primaryKey: true },
      name: { type: Sequelize.TEXT, allowNull: false },
      objective_id: { type: Sequelize.TEXT, allowNull: true },
      color: { type: Sequelize.TEXT, allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      mission_statement: { type: Sequelize.TEXT, allowNull: true },
      is_pinned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    // Optional foreign key constraint (if Objectives table exists)
    // await queryInterface.addConstraint('projects', {
    //   fields: ['objective_id'],
    //   type: 'foreign key',
    //   name: 'fk_projects_objective_id',
    //   references: { table: 'objectives', field: 'id' },
    //   onDelete: 'SET NULL',
    //   onUpdate: 'CASCADE',
    // });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("projects");
  },
};
