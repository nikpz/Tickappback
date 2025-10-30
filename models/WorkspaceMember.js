module.exports = (sequelize, DataTypes) => {
    const WorkspaceMember = sequelize.define(
      "WorkspaceMember",
      {
        id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
        workspace_id: {
          type: DataTypes.TEXT,
          allowNull: false,
          references: { model: "workspaces", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        user_id: {
          type: DataTypes.TEXT,
          allowNull: false,
          references: { model: "users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        role: {
          type: DataTypes.ENUM("owner", "admin", "member", "viewer"),
          allowNull: false,
          defaultValue: "member",
        },
      },
      {
        tableName: "workspace_members",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deletedAt",
        paranoid: true,
        timestamps: true,
      }
    );
  
    WorkspaceMember.associate = (models) => {
      WorkspaceMember.belongsTo(models.Workspace, {
        foreignKey: "workspace_id",
        as: "workspace",
      });
      WorkspaceMember.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    };
  
    return WorkspaceMember;
  };
  



/*
We want a many-to-many relationship between Workspace and User,
implemented as a join table WorkspaceMembers with a role and timestamps.

Workspace   ←→         WorkspaceMember                  ←→                        User

id         1️⃣         workspace_id                     🔗                        user_id

name            role (owner, admin, member, viewer)                               email, name

*/