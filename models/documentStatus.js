module.exports = (sequelize, DataTypes) => {
  const DocumentStatus = sequelize.define(
    "DocumentStatus",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      label: { type: DataTypes.TEXT, allowNull: true },
      color: { type: DataTypes.TEXT, allowNull: true },
      text_color: { type: DataTypes.TEXT, allowNull: true },
      // status_id: {
      //   type: DataTypes.TEXT,
      //   allowNull: false,
      //   references: {
      //     model: 'Document',
      //     key: 'id',
      //   },
      //   onDelete: 'CASCADE',
      // }
    },
    {
      tableName: "document_statuses",

      //new addsssss
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deletedAt',
      paranoid: true,
      timestamps: false,
    }
  );

  DocumentStatus.associate = (models) => {
    
    DocumentStatus.hasMany(models.Document, {
      foreignKey: "status_id",
      as: "documents",
    });
  };

  return DocumentStatus;
};
