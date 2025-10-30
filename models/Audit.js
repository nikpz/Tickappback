module.exports = (sequelize, DataTypes) => {
    const Audit = sequelize.define(
      "Audit",
      {
        id: { type: DataTypes.TEXT, primaryKey: true },
        entity_id: { type: DataTypes.TEXT, allowNull: false },
        entity_type: { type: DataTypes.TEXT, allowNull: false },
        action: { type: DataTypes.TEXT, allowNull: false },
        user_id: { type: DataTypes.TEXT, allowNull: false },
        timestamp: { type: DataTypes.BIGINT, allowNull: false },
        meta: { type: DataTypes.JSONB, allowNull: true },
      },
      {
        tableName: "audits",
        createdAt: "created_at",
        updatedAt: false,
        timestamps: false,
      }
    );
  
    return Audit;
  };
//This matches your front-end AuditLog type: { entityId, entityType, action, userId, timestamp }  