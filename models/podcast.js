// models/podcast.js
module.exports = (sequelize, DataTypes) => {
    const Podcast = sequelize.define(
      "Podcast",
      {
        id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
        title: { type: DataTypes.TEXT, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        audio_url: { type: DataTypes.TEXT, allowNull: true },
        duration_seconds: { type: DataTypes.INTEGER, allowNull: true },
        tags: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: true },
      },
      {
        tableName: "podcasts",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deletedAt",
        paranoid: true,
        timestamps: false,
      }
    );
  
    Podcast.associate = (models) => {
      Podcast.hasMany(models.LearningAssignment, {
        foreignKey: "resource_id",
        constraints: false,
        scope: { resource_type: "PODCAST" },
        as: "assignments",
      });
    };
  
    return Podcast;
  };
  