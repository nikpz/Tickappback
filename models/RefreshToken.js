module.exports = (sequelize, DataTypes) => {
    const RefreshToken = sequelize.define(
      "RefreshToken",
      {
        id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
        user_id: {
          type: DataTypes.TEXT,
          allowNull: false,
          references: { model: "users", key: "id" },
          onDelete: "CASCADE",
        },
        token: { type: DataTypes.TEXT, allowNull: false, unique: true },
        expires_at: { type: DataTypes.DATE, allowNull: false },
        revoked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        replaced_by_token: { type: DataTypes.TEXT, allowNull: true },
      },
      {
        tableName: "refresh_tokens",
        createdAt: "created_at",
        updatedAt: "updated_at",
        paranoid: false,
        timestamps: true,
      }
    );
  
    RefreshToken.associate = (models) => {
      RefreshToken.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    };
  
    return RefreshToken;
  };
//   Run migrations / sync as appropriate.