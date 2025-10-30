 async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("youtube_videos", {
    id: {
      type: Sequelize.TEXT,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    url: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    tags: {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: true,
    },
  });
}

 async function down(queryInterface) {
  await queryInterface.dropTable("youtube_videos");
}


module.exports = {up, down}
