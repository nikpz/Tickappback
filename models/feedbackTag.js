module.exports = (sequelize, DataTypes) => {
  const FeedbackTag = sequelize.define(
    "FeedbackTag",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      label: { type: DataTypes.TEXT, allowNull: false },
      name: { type: DataTypes.TEXT, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      icon: { type: DataTypes.TEXT, allowNull: true },
      color: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "feedback_tags",

      //new addsssss
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      paranoid: true,
      timestamps: true,
    }
  );


  FeedbackTag.associate = (models) => {
    //relation to task
    FeedbackTag.hasMany(models.KRCheckin, {
      foreignKey: "feedback_tag_id",
      as: "krCheckins",
    });
  };

  return FeedbackTag;
};

