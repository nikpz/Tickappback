// models/CustomerNeedCategory.js
module.exports = (sequelize, DataTypes) => {
  const CustomerNeedCategory = sequelize.define(
    "CustomerNeedCategory",
    {
      id: {
        type: DataTypes.TEXT,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      color: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "customer_need_categories",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      paranoid: true,
      timestamps: true,
    }
  );

  CustomerNeedCategory.associate = (models) => {
    CustomerNeedCategory.hasMany(models.CustomerNeed, {
      foreignKey: "category_id",
      as: "needs",
    });
  };

  return CustomerNeedCategory;
};
