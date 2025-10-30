module.exports = (sequelize, DataTypes) => {
    const CompanyValue = sequelize.define('CompanyValue', {
      id: { type: DataTypes.TEXT, primaryKey: true },
      company_vision_id: { type: DataTypes.INTEGER, allowNull: false },
      text: { type: DataTypes.TEXT, allowNull: false },
      icon: { type: DataTypes.TEXT, allowNull: true },
      color: { type: DataTypes.TEXT, allowNull: true },
    }, {
      tableName: 'company_values',

      //new addsssss
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deletedAt',
      paranoid: true,
      timestamps: false,
    });
  
    CompanyValue.associate = (models) => {
      CompanyValue.belongsTo(models.CompanyVision, {
        foreignKey: 'company_vision_id',
        as: 'vision',
      });
    };
  
    return CompanyValue;
  };
  