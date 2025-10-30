module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define(
    "Team",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      name: { type: DataTypes.TEXT, allowNull: true },

      leadId: {
        type: DataTypes.TEXT,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      icon: { type: DataTypes.TEXT, allowNull: true },

      category: { type: DataTypes.TEXT, allowNull: true },
      //To enforc category consistency
      // category: {
      //   type: DataTypes.ENUM("محصول", "فنی", "فروش", "بازاریابی", "عمومی"),
      //   allowNull: true,
      // },
    },
    {
      tableName: "teams",
      deletedAt: "deletedAt",
      paranoid: true,
      timestamps: true, //// createdAt & updatedAt
    }
  );

  Team.associate = (models) => {
    //leadId references a User who is the team lead.
    //leadId links to a single user.
    Team.belongsTo(models.User, { foreignKey: "leadId", as: "lead" });
    //Team.belongsTo(models.User, { foreignKey: 'leadId', as: 'lead' });
    //members is a list of users in this team.
    //memberIds updates the users’ teamId to this team.
    //The Team’s members is derived dynamically via the association.
    //listTeams returns lead + members. (assiciate with user model)
    Team.hasMany(models.User, { foreignKey: "teamId", as: "members" });
    //   Team.belongsToMany(models.User, { through: models.TeamMember, foreignKey: 'team_id', otherKey: 'user_id', as: 'members' });
  };

  return Team;
};

/*
  In Sequelize/Postgres, memberIds is not stored as a field in the Team table. Instead, it’s handled via associations.
  We model the members with foreign keys in the User table:
  Sequelize will return something like:
  [
    {
        "id": "t1",
        "name": "تیم محصول",
        "lead": { "id": "u2", "username": "lead" },
        "members": [
        { "id": "u1", "username": "admin" },
        { "id": "u3", "username": "member" },
        { "id": "u4", "username": "member2" }
        ]
    }
  ]


  ✅ So memberIds is not a column, it’s computed from the members association.


  */
