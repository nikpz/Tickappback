// models/Board.js
module.exports = (sequelize, DataTypes) => {
    const Board = sequelize.define(
      "Board",
      {
        id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
        title: { type: DataTypes.TEXT, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        project_id: {
          type: DataTypes.TEXT,
          allowNull: true,
          references: { model: "projects", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        isPinned: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        order: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        settings: {
          type: DataTypes.JSONB,
          allowNull: true,
          defaultValue: {},
        },
      },
      {
        tableName: "boards",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deletedAt",
        paranoid: true,
        timestamps: true,
      }
    );
  
    Board.associate = (models) => {
      Board.belongsTo(models.Project, { foreignKey: "project_id", as: "project" });
      Board.hasMany(models.KanbanColumn, { foreignKey: "board_id", as: "columns" });
    };
  
    return Board;
  };
  