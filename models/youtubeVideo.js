module.exports = (sequelize, DataTypes) => {
  const YouTubeVideo = sequelize.define(
    "YouTubeVideo",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      title: { type: DataTypes.TEXT, allowNull: true },
      url: { type: DataTypes.TEXT, allowNull: true },
      tags: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: true },
    },
    {
      tableName: "youtube_videos",

      //new addsssss
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deletedAt',
      paranoid: true,

      timestamps: false,
    }
  );

  YouTubeVideo.associate = (models) => {
    YouTubeVideo.hasMany(models.LearningAssignment, {
      foreignKey: "resource_id",
      constraints: false,
      scope: { resource_type: "YOUTUBE_VIDEO" },
      as: "assignments",
    });
  };

  return YouTubeVideo;
};
