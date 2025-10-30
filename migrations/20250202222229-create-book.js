 async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("books", { 
    id: {
      type: Sequelize.TEXT,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    author: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    cover_image_url: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  });
}

 async function down(queryInterface) {
  await queryInterface.dropTable("books");
}
module.exports = {up, down}
