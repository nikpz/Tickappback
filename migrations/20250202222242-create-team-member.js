 async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("team_members", {
    team_id: {
      type: Sequelize.TEXT,
      allowNull: false,
      // If you have a Teams table, uncomment:
      // references: { model: 'teams', key: 'id' },
      // onUpdate: 'CASCADE',
      // onDelete: 'CASCADE',
    },
    user_id: {
      type: Sequelize.TEXT,
      allowNull: false,
      // If you have a Users table, uncomment:
      // references: { model: 'users', key: 'id' },
      // onUpdate: 'CASCADE',
      // onDelete: 'CASCADE',
    },
    added_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  // Optional composite primary key to prevent duplicate memberships
  await queryInterface.addConstraint("team_members", {
    fields: ["team_id", "user_id"],
    type: "primary key",
    name: "team_members_pkey",
  });
}

 async function down(queryInterface) {
  await queryInterface.dropTable("team_members");
}
module.exports = {up, down}

