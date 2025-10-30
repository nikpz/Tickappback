// models/Workspace.js
module.exports = (sequelize, DataTypes) => {
  const Workspace = sequelize.define(
    "Workspace",
    {
      id: {
        type: DataTypes.TEXT,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      color: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      icon: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      type: DataTypes.ENUM("company", "individual"), // if desired
      company_name: DataTypes.TEXT,
      owner_id: {
        type: DataTypes.TEXT,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      settings: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
    },
    {
      tableName: "workspaces",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deletedAt",
      paranoid: true,
      timestamps: true,
    }
  );

  Workspace.associate = (models) => {
    Workspace.hasMany(models.Project, {
      foreignKey: "workspace_id",
      as: "projects",
    });
    Workspace.hasMany(models.Board, {
      foreignKey: "workspace_id",
      as: "boards",
    });
    Workspace.belongsTo(models.User, {
      foreignKey: "owner_id",
      as: "owner",
    });
    Workspace.hasMany(models.WorkspaceMember, {
      foreignKey: "workspace_id",
      as: "members",
    });
  };

  return Workspace;
};
