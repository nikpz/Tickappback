module.exports = (sequelize, DataTypes) => {
  const IndexModel = sequelize.define(
    "Index",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      name: { type: DataTypes.TEXT, allowNull: false },
      category: { type: DataTypes.TEXT, allowNull: true },
      icon: { type: DataTypes.TEXT, allowNull: true },
      owner_ids: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: [],
      },
      // new optional fields
      unit: { type: DataTypes.TEXT, allowNull: true }, // e.g. "%", "score", "days"
      current_value: { type: DataTypes.FLOAT, allowNull: true },
      target_value: { type: DataTypes.FLOAT, allowNull: true },
      strategy_id: { type: DataTypes.TEXT, allowNull: true }, // link to a strategy
    },
    {
      tableName: "indices",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deletedAt",
      paranoid: true,
      timestamps: true,
    }
  );

  IndexModel.associate = (models) => {
    IndexModel.belongsTo(models.Strategy, { foreignKey: "strategy_id" });
  };
  return IndexModel;
};
