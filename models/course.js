// models/course.js
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define(
    "Course",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      title: { type: DataTypes.TEXT, allowNull: true },
      summary: { type: DataTypes.TEXT, allowNull: true },
      provider: { type: DataTypes.TEXT, allowNull: true },
      url: { type: DataTypes.TEXT, allowNull: true },
      tags: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: true },
    },
    {
      tableName: "courses",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deletedAt",
      paranoid: true,
      timestamps: false,
    }
  );

  Course.associate = (models) => {
    Course.hasMany(models.LearningAssignment, {
      foreignKey: "resource_id",
      constraints: false,
      scope: { resource_type: "COURSE" },
      as: "assignments",
    });
  };

  return Course;
};
