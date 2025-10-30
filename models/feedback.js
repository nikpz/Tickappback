//To persist feedback messages (not just tags)
module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define(
    "Feedback",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      giver_id: { type: DataTypes.TEXT, allowNull: false },
      receiver_id: { type: DataTypes.TEXT, allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
      tag_id: {
        type: DataTypes.TEXT,
        references: { model: "feedback_tags", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    },
    {
      tableName: "feedbacks",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  Feedback.associate = (models) => {
    Feedback.belongsTo(models.FeedbackTag, {
      foreignKey: "tag_id",
      as: "tag",
    });
  };

  return Feedback;
};
