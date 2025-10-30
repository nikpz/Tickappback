module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define(
      "Notification",
      {
        id: { type: DataTypes.TEXT, primaryKey: true, allowNull: false },
        user_id: { type: DataTypes.TEXT, allowNull: false },
        type: {
          type: DataTypes.ENUM("task", "objective", "mention", "feedback", "system"),
          allowNull: false,
        },
        item_id: { type: DataTypes.TEXT, allowNull: true }, // reference to related entity
        message: { type: DataTypes.TEXT, allowNull: false },
        is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
      },
      {
        tableName: "notifications",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deletedAt",
        paranoid: true,
        timestamps: true,
      }
    );
  
    Notification.associate = (models) => {
      Notification.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    };
  
    return Notification;
};