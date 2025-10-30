module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    "Task",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      icon: { type: DataTypes.TEXT, allowNull: true },
      content: { type: DataTypes.TEXT, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      status: { type: DataTypes.TEXT, allowNull: true },
      start_date: { type: DataTypes.DATE, allowNull: true },
      due_date: { type: DataTypes.DATE, allowNull: true },
      progress: { type: DataTypes.FLOAT, allowNull: true },
      recurrence: { type: DataTypes.JSONB, allowNull: true },
      custom_fields: { type: DataTypes.JSONB, allowNull: true },
      monitoring: { type: DataTypes.JSONB, allowNull: true },
      numeric_value: { type: DataTypes.DOUBLE, allowNull: true },
      prerequisites: { type: DataTypes.JSONB, allowNull: true },
      prerequisite_completion: { type: DataTypes.JSONB, allowNull: true },
      color: { type: DataTypes.TEXT, allowNull: true },
      daily_target_kr_id: { type: DataTypes.TEXT, allowNull: true },
      parent_id: { type: DataTypes.TEXT, allowNull: true },
      isArchived: { type: DataTypes.BOOLEAN, defaultValue: false },
      // ✅ Foreign key column
      assignee_id: {
        type: DataTypes.TEXT,
        allowNull: true,
        references: {
          model: "users", // must match your table name (lowercase, plural if that’s how it’s defined)
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      // ✅ Foreign key column
      project_id: {
        type: DataTypes.TEXT,
        allowNull: true,
        references: {
          model: "projects", // must match your table name (lowercase, plural if that’s how it’s defined)
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      assignee_team_id: {
        type: DataTypes.TEXT,
        allowNull: true,
        references: {
          model: "teams", // must match your table name (lowercase, plural if that’s how it’s defined)
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      column_id: {
        type: DataTypes.TEXT,
        allowNull: true,
        references: {
          // model: 'tasks', // must match your table name (lowercase, plural if that’s how it’s defined)
          model: "kanban_columns", // should match your actual table name
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
    },
    {
      tableName: "tasks",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deletedAt",
      paranoid: true,
      timestamps: true,
    }
  );

  Task.associate = (models) => {
    Task.belongsTo(models.Project, { foreignKey: "project_id", as: "project" });
    Task.belongsTo(models.User, { foreignKey: "assignee_id", as: "assignee" });
    Task.belongsTo(models.Team, {
      foreignKey: "assignee_team_id",
      as: "assigneeTeam",
    });
    Task.belongsTo(models.KanbanColumn, {
      foreignKey: "column_id",
      as: "column",
    });
    Task.hasMany(models.TaskComment, { foreignKey: "task_id", as: "comments" });
    Task.hasMany(models.TaskChecklistItem, {
      foreignKey: "task_id",
      as: "checklist",
    });
    Task.belongsToMany(models.TaskTag, {
      through: models.TaskTagLink,
      foreignKey: "task_id",
      otherKey: "tag_id",
      as: "tags",
    });
    //   Task.hasMany(models.TaskComment, { foreignKey: 'task_id', as: 'comments' });
    //   Task.hasMany(models.TaskChecklistItem, { foreignKey: 'task_id', as: 'checklistItems' });
    //   Task.belongsToMany(models.TaskTag, { through: models.TaskTagLink, foreignKey: 'task_id', otherKey: 'tag_id', as: 'tags' });
  };

  return Task;
};
