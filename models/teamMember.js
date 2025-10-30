module.exports = (sequelize, DataTypes) => {
  const TeamMember = sequelize.define(
    "TeamMember",
    {
      team_id: { type: DataTypes.TEXT, allowNull: false },
      user_id: { type: DataTypes.TEXT, allowNull: false },
      added_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "team_members",

      //new addsssss
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deletedAt',
      paranoid: true,

      timestamps: false,
    }
  );

  return TeamMember;
};
