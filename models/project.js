module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    "Project",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      name: { type: DataTypes.TEXT, allowNull: false },
      objective_id: { type: DataTypes.TEXT, allowNull: true }, // relation to Objective
      color: { type: DataTypes.TEXT, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      mission_statement: { type: DataTypes.TEXT, allowNull: true },
      is_pinned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      workspace_id: {
        type: DataTypes.TEXT,
        allowNull: true,
        references: { model: "workspaces", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      is_archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "projects",

      //new addsssss
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deletedAt",
      paranoid: true,
      timestamps: true, // adds createdAt and updatedAt
    }
  );

  // Example association (optional)
  Project.associate = (models) => {
    Project.belongsTo(models.Objective, {
      foreignKey: "objective_id",
      as: "objective",
    });
    Project.belongsTo(models.Workspace, {
      foreignKey: "workspace_id",
      as: "workspace",
    });
    Project.hasMany(models.Board, { foreignKey: "project_id", as: "boards" });
    Project.hasMany(models.ProjectMember, {
      foreignKey: "project_id",
      as: "members",
    });
    // hasmany kanban !!!!!!!!!!!!!!!!!!!!
  };

  return Project;
};
