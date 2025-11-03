// Backend Model: Comment.js
// Place this file in: backend/models/comment.js

module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: { 
      type: DataTypes.TEXT, 
      primaryKey: true,
      allowNull: false
    },
    kr_id: {
      type: DataTypes.TEXT,
      allowNull: false,
      references: { model: 'key_results', key: 'id' },
      onDelete: 'CASCADE',
    },
    author_id: { 
      type: DataTypes.TEXT, 
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    text: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },
  }, {
    tableName: 'kr_comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.KeyResult, { foreignKey: 'kr_id', as: 'keyResult' });
    Comment.belongsTo(models.User, { foreignKey: 'author_id', as: 'author' });
  };

  return Comment;
};
