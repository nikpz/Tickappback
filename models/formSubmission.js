module.exports =  (sequelize, DataTypes) => {
    const FormSubmission = sequelize.define('FormSubmission', {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      form_id: { type: DataTypes.TEXT, allowNull: false},
      values: {type: DataTypes.JSONB, allowNull: true, defaultValue: []},
      submitted_by_id: { type: DataTypes.TEXT, allowNull: false },
      submitted_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      serial_number: {type: DataTypes.TEXT, allowNull: true},
      status: {type: DataTypes.TEXT, allowNull: true},
    }, {
      tableName: 'form_submissions',
      timestamps: true,
      createdAt: 'submitted_at',
      //new addsssss
      updatedAt: 'updated_at',
      deletedAt: 'deletedAt',
      paranoid: true,
    });
  
    FormSubmission.associate = (models) => {
      FormSubmission.belongsTo(models.Form, { foreignKey: 'form_id', as: 'form' });
      //user = lead or manager
      FormSubmission.belongsTo(models.User, { foreignKey: 'submitted_by_id', as: 'submittedBy' });
    };
  
    return FormSubmission;
  };
  