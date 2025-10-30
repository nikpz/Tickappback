module.exports = (sequelize, DataTypes) => {
  const Form = sequelize.define(
    "Form",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      title: { type: DataTypes.TEXT, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      display_mode: DataTypes.ENUM("MULTI_STEP", "SINGLE_PAGE"),
      fields: DataTypes.JSONB,
      is_pinned: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      form_code: { type: DataTypes.TEXT, allowNull: true },
      approval_date: { type: DataTypes.DATE, allowNull: true },
      version: { type: DataTypes.TEXT, allowNull: true },
      unit: { type: DataTypes.TEXT, allowNull: true },
      approval_code: { type: DataTypes.TEXT, allowNull: true },
      next_serial_number: { type: DataTypes.INTEGER, allowNull: true },
      creator_id: {
        type: DataTypes.TEXT,
        allowNull: false,
        references: {
          model: 'users', // ✅ table name, not model name
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      category_id: {
        type: DataTypes.TEXT,
        allowNull: true, /**defaultValue: 0,*/
        references: {
          model: 'form_categories', // ✅ table name, not model name
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    },
    {
      tableName: "forms",

      //new addsssss
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deletedAt',
      paranoid: true,
      timestamps: true,
    }
  );

  Form.associate = (models) => {

    Form.belongsTo(models.FormCategory, { foreignKey: "category_id",  as: "category" });
    Form.belongsTo(models.User,         { foreignKey: "creator_id",   as: "creator" });
    Form.hasMany(models.FormSubmission, { foreignKey: "form_id",      as: "submissions" });
  };

  return Form;
};
