module.exports = (sequelize, DataTypes) => {
    const GeneralFeedback = sequelize.define(
      "GeneralFeedback",
      {
        id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
        giver_id: { type: DataTypes.TEXT, allowNull: false },
        receiver_id: { type: DataTypes.TEXT, allowNull: true },
        text: { type: DataTypes.TEXT, allowNull: false },
        tags: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: true, defaultValue: [] },
      },
      {
        tableName: "general_feedbacks",
        createdAt: "created_at",
        updatedAt: "updated_at",
        paranoid: true,
        timestamps: true,
      }
    );
  
    GeneralFeedback.associate = (models) => {
      GeneralFeedback.belongsTo(models.User, { foreignKey: "giver_id", as: "giver" });
      GeneralFeedback.belongsTo(models.User, { foreignKey: "receiver_id", as: "receiver" });
    };
  
    return GeneralFeedback;
  };
