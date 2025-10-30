module.exports = (sequelize, DataTypes) => {
  const TaskTagLink = sequelize.define('TaskTagLink', {
    task_id: { type: DataTypes.TEXT, allowNull: false },
    tag_id: { type: DataTypes.TEXT, allowNull: false },
  }, {
    tableName: 'task_tag_links',
    timestamps: false,
  });

  return TaskTagLink;
};