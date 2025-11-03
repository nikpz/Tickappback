// Backend Migration: Create KR Comments Table
// File name: YYYYMMDDHHMMSS-create-kr-comments.js
// Place this file in: backend/migrations/
// Replace YYYYMMDDHHMMSS with current timestamp (e.g., 20250101120000)

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('kr_comments', {
      id: {
        type: Sequelize.TEXT,
        primaryKey: true,
        allowNull: false,
      },
      kr_id: {
        type: Sequelize.TEXT,
        allowNull: false,
        references: { model: 'key_results', key: 'id' },
        onDelete: 'CASCADE',
      },
      author_id: {
        type: Sequelize.TEXT,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('kr_comments', ['kr_id']);
    await queryInterface.addIndex('kr_comments', ['author_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('kr_comments');
  },
};
