 async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("kanban_columns", {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,

    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    color: {
      type: Sequelize.STRING, 
      defaultValue: 'gray',
    },
    icon: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    order: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });
}

 async function down(queryInterface) {
  await queryInterface.dropTable("kanban_columns");
}
module.exports = {up, down}
