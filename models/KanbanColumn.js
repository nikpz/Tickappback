// import { DataTypes, Model } from 'sequelize';

module.exports =  (sequelize, DataTypes) => {
    // class KanbanColumn extends Model {}
    const KanbanColumn = sequelize.define('KanbanColumn', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING,
        defaultValue: 'gray',
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // for sorting columns visually
      },
    },
    {
      sequelize,
      modelName: 'KanbanColumn',
      tableName: 'kanban_columns',

      //new addsssss
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deletedAt',
      paranoid: true,
      timestamps: true,
    }
  );

  KanbanColumn.associate = (models) => {
    KanbanColumn.hasMany(models.Task, {
      foreignKey: 'column_id', // this should match your task model’s field
      as: 'tasks'
    });
  };

  return KanbanColumn;
};
