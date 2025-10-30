module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      // id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      name: { type: DataTypes.TEXT, allowNull: true },
      username: { type: DataTypes.TEXT, allowNull: false, unique: true },
      password: { type: DataTypes.TEXT, allowNull: false },
      role: {
        type: DataTypes.ENUM("admin", "lead", "member"),
        defaultValue: "member",
        allowNull: false,
      },
      avatarUrl: { type: DataTypes.TEXT, allowNull: true },
      signatureUrl: { type: DataTypes.TEXT, allowNull: true },
      preferences: {
        //Now you can store theme, sidebarCollapsed, activePage, etc., for each user.
        type: DataTypes.JSONB, // Use JSONB for Postgres, JSON for MySQL
        allowNull: true,
        defaultValue: {
          theme: "light",
          sidebarCollapsed: false,
          activeWorkspaceId: "",
        },
      },
      teamId: {
        type: DataTypes.TEXT,
        //👉 allowNull: true only means the column can be empty (NULL).
        //It does not disable the foreign key rule.
        allowNull: true,
        references: { model: "teams", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    },
    {
      tableName: "users",

      //new addsssss
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deletedAt",
      paranoid: true,

      timestamps: true,
    }
  );
  User.associate = (models) => {
    //Each User has teamId pointing to their team.
    //// User model has a teamId column(associate with team model)
    User.belongsTo(models.Team, { foreignKey: "teamId", as: "team" });
    User.hasMany(models.Objective, {
      foreignKey: "owner_id",
      as: "objectives",
    });
    User.hasMany(models.KeyResult, {
      foreignKey: "owner_id",
      as: "keyResults",
    });
    User.hasMany(models.Task, { foreignKey: "assignee_id", as: "tasks" });
    User.belongsToMany(models.Team, {
      through: models.TeamMember,
      foreignKey: "user_id",
      otherKey: "team_id",
      as: "teams",
    });
    User.hasMany(models.ProjectMember, {
      foreignKey: "user_id",
      as: "projectMemberships",
    });
    User.hasMany(models.WorkspaceMember, {
      foreignKey: "user_id",
      as: "workspaceMemberships",
    });
  };
  return User;
};

/*

  module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING, allowNull: false }
    }, {
      tableName: 'users',
      timestamps: true
    });
    return User;
  };

*/
