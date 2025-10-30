module.exports = (sequelize, DataTypes) => {
  const KRCheckin = sequelize.define(
    "KRCheckin",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      date: { type: DataTypes.DATE, allowNull: true },
      value: { type: DataTypes.DOUBLE, allowNull: true },
      rating: { type: DataTypes.INTEGER, allowNull: true },
      report: { type: DataTypes.JSONB, allowNull: true },
      feedback_giver_id: {
        type: DataTypes.TEXT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      feedback_tag_id: {
        type: DataTypes.TEXT,
        allowNull: false,
        references: {
          model: 'feedback_tags',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      kr_id: {
        type: DataTypes.TEXT,
        allowNull: false,
        references: {
          model: 'key_results',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: DataTypes.TEXT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: "kr_checkins",

      //new addsssss
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deletedAt',
      paranoid: true,
      timestamps: false,
    }
  );

  KRCheckin.associate = (models) => {
    //report = KeyResult
    KRCheckin.belongsTo(models.KeyResult, {
      foreignKey: "kr_id",
      as: "keyResult",
    });
    //okr = goal or objectives???
    KRCheckin.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return KRCheckin;
};
