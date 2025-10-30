module.exports = (sequelize, DataTypes) => {
  const KeyResult = sequelize.define(
    "KeyResult",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      title: { type: DataTypes.TEXT, allowNull: true },
      category: {
        type: DataTypes.ENUM("Standard", "Stretch", "Binary", "Assignment"),
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM(
          "Number",
          "Percentage",
          "Currency",
          "Binary",
          "Assignment"
        ),
        allowNull: true,
      },
      start_value: { type: DataTypes.DOUBLE, allowNull: true },
      current_value: { type: DataTypes.DOUBLE, allowNull: true },
      target_value: { type: DataTypes.DOUBLE, allowNull: true },
      daily_target: { type: DataTypes.JSONB, allowNull: true },
      periodic_target: { type: DataTypes.JSONB, allowNull: true }, // NEW
      stretch_levels: { type: DataTypes.JSONB, allowNull: true },
      binary_labels: { type: DataTypes.JSONB, allowNull: true },
      assigned_task_ids: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true,
      },
      assigned_form_ids: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true,
      }, // NEW
      owner_id: {
        type: DataTypes.TEXT,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      objective_id: {
        type: DataTypes.TEXT,
        allowNull: true,
        references: { model: "objectives", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      is_archived: { type: DataTypes.BOOLEAN, defaultValue: false }, // NEW
    },
    {
      tableName: "key_results",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deletedAt",
      paranoid: true,
      timestamps: true,
    }
  );

  KeyResult.associate = (models) => {
    KeyResult.belongsTo(models.Objective, {
      foreignKey: "objective_id",
      as: "objective",
    });
    KeyResult.belongsTo(models.User, { foreignKey: "owner_id", as: "owner" });
    KeyResult.hasMany(models.KRCheckin, {
      foreignKey: "kr_id",
      as: "checkIns",
    });
    KeyResult.hasMany(models.Comment, {
      foreignKey: "kr_id",
      as: "comments",
    }); // NEW
  };

  return KeyResult;
};

/*module.exports = (sequelize, DataTypes) => {
  const KeyResult = sequelize.define(
    "KeyResult",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      title: { type: DataTypes.TEXT, allowNull: true },
      category: {
        type: DataTypes.ENUM("Standard", "Stretch", "Binary", "Assignment"),
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM(
          "Number",
          "Percentage",
          "Currency",
          "Binary",
          "Assignment"
        ),
        allowNull: true,
      },
      start_value: { type: DataTypes.DOUBLE, allowNull: true },
      current_value: { type: DataTypes.DOUBLE, allowNull: true },
      target_value: { type: DataTypes.DOUBLE, allowNull: true },
      daily_target: { type: DataTypes.JSONB, allowNull: true },
      stretch_levels: { type: DataTypes.JSONB, allowNull: true },
      binary_labels: { type: DataTypes.JSONB, allowNull: true },
      assigned_task_ids: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true,
      },
      owner_id: {
        type: DataTypes.TEXT,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      objective_id: {
        type: DataTypes.TEXT,
        allowNull: true,
        references: { model: "objectives", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    },
    {
      tableName: "key_results",

      //new addsssss
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deletedAt',
      paranoid: true,
      timestamps: true,
    }
  );

  KeyResult.associate = (models) => {
    KeyResult.belongsTo(models.Objective, {
      foreignKey: "objective_id",
      as: "objective",
    });
    KeyResult.belongsTo(models.User, { foreignKey: "owner_id", as: "owner" });
    KeyResult.hasMany(models.KRCheckin, {
      foreignKey: "kr_id",
      as: "checkins",
    });
  };

  return KeyResult;
};
*/
