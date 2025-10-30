module.exports = (sequelize, DataTypes) => {
  const TaskTag = sequelize.define('TaskTag', {
    id: { type: DataTypes.TEXT, primaryKey: true },
    text: { type: DataTypes.STRING, allowNull: false },
    color: { type: DataTypes.STRING, allowNull: true },
  }, {
    tableName: 'task_tags',
    timestamps: false,
  });

  TaskTag.associate = (models) => {
    TaskTag.belongsToMany(models.Task, {
      through: models.TaskTagLink,
      foreignKey: 'tag_id',
      otherKey: 'task_id',
      as: 'tasks',
    });
  };

  return TaskTag;
};
