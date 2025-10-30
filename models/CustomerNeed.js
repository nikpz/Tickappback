// models/CustomerNeed.js
module.exports = (sequelize, DataTypes) => {
  const CustomerNeed = sequelize.define(
    "CustomerNeed",
    {
      id: {
        type: DataTypes.TEXT,
        allowNull: false,
        primaryKey: true,
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category_id: {
        type: DataTypes.TEXT,
        allowNull: true,
        references: {
          model: "customer_need_categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high", "critical"),
        allowNull: false,
        defaultValue: "medium",
      },
      source: {
        type: DataTypes.TEXT,
        allowNull: true, // e.g. "survey", "support ticket", etc.
      },
      status: {
        type: DataTypes.ENUM("open", "in_progress", "resolved"),
        allowNull: false,
        defaultValue: "open",
      },
      created_by: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "customer_needs",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      paranoid: true,
      timestamps: true,
    }
  );

  CustomerNeed.associate = (models) => {
    CustomerNeed.belongsTo(models.CustomerNeedCategory, {
      foreignKey: "category_id",
      as: "category",
    });
  };

  return CustomerNeed;
};
