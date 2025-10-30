module.exports = (sequelize, DataTypes) => {
    const CompanyVision = sequelize.define('CompanyVision', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      mission_title: { type: DataTypes.TEXT, allowNull: true },
      passion: { type: DataTypes.TEXT, allowNull: true },
      skill: { type: DataTypes.TEXT, allowNull: true },
      market: { type: DataTypes.TEXT, allowNull: true },
      business: { type: DataTypes.TEXT, allowNull: true },
      five_year_vision: { type: DataTypes.TEXT, allowNull: true },
    }, {
      tableName: 'company_visions',

      //new addsssss
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deletedAt',
      paranoid: true,
      timestamps: true,
    });
  
    CompanyVision.associate = (models) => {
      CompanyVision.hasMany(models.CompanyValue, {
        foreignKey: 'company_vision_id',
        as: 'values',
        onDelete: 'CASCADE',
      });
    };
  
    return CompanyVision;
  };
  