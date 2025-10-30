'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('company_visions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true }, 
      mission_title: { type: Sequelize.TEXT, allowNull: true},
      passion: { type: Sequelize.TEXT, allowNull: true },
      skill: { type: Sequelize.TEXT, allowNull: true },
      market: { type: Sequelize.TEXT, allowNull: true },
      business: { type: Sequelize.TEXT, allowNull: true },
      five_year_vision: { type: Sequelize.TEXT,allowNull: true },
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('company_visions');
  },
};
