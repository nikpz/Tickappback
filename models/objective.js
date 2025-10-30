module.exports = (sequelize, DataTypes) => {
  const Objective = sequelize.define(
    "Objective",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      title: { type: DataTypes.TEXT, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      category: { type: DataTypes.TEXT, allowNull: true },
      owner_id: {
        type: DataTypes.TEXT,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      strategy_id: {
        type: DataTypes.TEXT,
        allowNull: true,
        references: { model: "strategies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      parent_id: {
        type: DataTypes.TEXT,
        allowNull: true,
        references: { model: "objectives", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      
    },
    {
      tableName: "objectives",

      //new addsssss
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deletedAt',
      paranoid: true,
      timestamps: true,
    }
  );

  Objective.associate = (models) => {
    Objective.belongsTo(models.User/**models.Team */, { foreignKey: "owner_id", as: "owner" });
    Objective.belongsTo(models.Strategy, {
      foreignKey: "strategy_id",
      as: "strategy",
    }); //////////////
    Objective.hasMany(models.KeyResult, {
      foreignKey: "objective_id",
      as: "keyResults",
    });
    Objective.hasMany(models.Project, {
      foreignKey: "objective_id",
      as: "projects",
    }); //////////////////
    Objective.belongsTo(models.Objective, {
      foreignKey: "parent_id",
      as: "parent",
    });
  };

  return Objective;
};
