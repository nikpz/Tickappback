module.exports = (sequelize, DataTypes) => {
  const FormCategory = sequelize.define(
    "FormCategory",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      title: { type: DataTypes.TEXT, allowNull: false },
      color: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "form_categories",

      //new addsssss
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deletedAt',
      paranoid: true,
      timestamps: false,
    }
  );

  FormCategory.associate = (models) => {
    FormCategory.hasMany(models.Form, {
      foreignKey: "category_id",
      as: "forms",
    });
  };

  return FormCategory;
};
