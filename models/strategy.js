module.exports = (sequelize, DataTypes) => {
  const Strategy = sequelize.define(
    "Strategy",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      name: { type: DataTypes.TEXT, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      icon: { type: DataTypes.TEXT, allowNull: true },
      owner_ids: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        field: "owner_ids",
        allowNull: false,
        defaultValue: [],
      },
      category: { type: DataTypes.TEXT, allowNull: true },
      status: { type: DataTypes.TEXT, allowNull: true },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "start_date",
      },
      end_date: { type: DataTypes.DATE, allowNull: true, field: "end_date" },
      swot: { type: DataTypes.JSONB, allowNull: true },
    },
    {
      tableName: "strategies",

      //new addsssss
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deletedAt",
      paranoid: true,

      timestamps: true, // createdAt & updatedAt
    }
  );
  /**belongsTo Team, user */
  Strategy.associate = (models) => {
    Strategy.hasMany(models.Index, { foreignKey: "strategy_id" });
  };

  return Strategy;
};
