 async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("kr_checkins", {
    id: {
      type: Sequelize.TEXT,
      primaryKey: true,
      allowNull: false,
    },
    date: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    value: {
      type: Sequelize.DOUBLE,
      allowNull: true,
    }, 
    rating: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    report: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
  });
}

 async function down(queryInterface) {
  await queryInterface.dropTable("kr_checkins");
}
module.exports = {up, down}
