module.exports = (sequelize, DataTypes) => {
  const TaskChecklistItem = sequelize.define('TaskChecklistItem', {
    id: { type: DataTypes.TEXT, primaryKey: true },
    task_id: {
      type: DataTypes.TEXT,
      allowNull: false,
      references: { model: 'tasks', key: 'id' },
      onDelete: 'CASCADE',
    },
    text: { type: DataTypes.TEXT, allowNull: false },
    completed: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: 'task_checklist_items',
    timestamps: true,
  });

  TaskChecklistItem.associate = (models) => {
    TaskChecklistItem.belongsTo(models.Task, { foreignKey: 'task_id', as: 'task' });
  };

  return TaskChecklistItem;
};
