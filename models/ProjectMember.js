module.exports = (sequelize, DataTypes) => {
    const ProjectMember = sequelize.define(
      "ProjectMember",
      {
        id: {
          type: DataTypes.TEXT,
          allowNull: false,
          primaryKey: true,
        },
        project_id: {
          type: DataTypes.TEXT,
          allowNull: false,
          references: { model: "projects", key: "id" },
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
          type: DataTypes.ENUM("owner", "lead", "member", "viewer"),
          allowNull: false,
          defaultValue: "member",
        },
      },
      {
        tableName: "project_members",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deletedAt",
        paranoid: true,
        timestamps: true,
      }
    );
  
    ProjectMember.associate = (models) => {
      ProjectMember.belongsTo(models.Project, {
        foreignKey: "project_id",
        as: "project",
      });
      ProjectMember.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    };
  
    return ProjectMember;
};