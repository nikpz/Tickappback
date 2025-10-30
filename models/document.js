module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define(
    "Document",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      title: { type: DataTypes.TEXT, allowNull: true },
      icon: { type: DataTypes.TEXT, allowNull: true },
      content: { type: DataTypes.JSONB, allowNull: true },
      font_family: { type: DataTypes.TEXT, allowNull: true },
      font_size: { type: DataTypes.TEXT, allowNull: true },
      creator_id: {
        type: DataTypes.TEXT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      status_id: {
        type: DataTypes.TEXT,
        allowNull: false,
        references: {
          model: 'document_statuses',
          key: 'id',
        },
        onDelete: 'CASCADE',
      }
    },
    {
      tableName: "documents",
      timestamps: true,
      createdAt: "created_at",

      //new addsssss
      deletedAt: 'deletedAt',
      paranoid: true,
      updatedAt: "last_updated_at",
    }
  );

  Document.associate = (models) => {
    //user = lead or manager
    Document.belongsTo(models.User, {
      foreignKey: "creator_id",
      as: "creator",
    });
    //
    Document.belongsTo(models.DocumentStatus, {
      foreignKey: "status_id",
      as: "status",
    });
  };

  return Document;
};
