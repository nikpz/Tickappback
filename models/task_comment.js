module.exports = (sequelize, DataTypes) => {
  const TaskComment = sequelize.define('TaskComment', {
    id: { type: DataTypes.TEXT, primaryKey: true },
    task_id: {
      type: DataTypes.TEXT,
      allowNull: false,
      references: { model: 'tasks', key: 'id' },
      onDelete: 'CASCADE',
    },
    author_id: { type: DataTypes.TEXT, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
  }, {
    tableName: 'task_comments',
    timestamps: true,
  });

  TaskComment.associate = (models) => {
    TaskComment.belongsTo(models.Task, { foreignKey: 'task_id', as: 'task' });
  };

  return TaskComment;
};
