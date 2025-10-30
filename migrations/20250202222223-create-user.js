 async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.TEXT,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      username: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('admin', 'lead', 'member'),
        allowNull: true,
      },
      avatarUrl: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      signatureUrl: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      teamId: {
        type: Sequelize.TEXT,
        allowNull: true,                            // ← this just allows NULL
        references: { model: 'teams', key: 'id' },  // ← this still enforces FK rule
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false, 
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  }
  
   async function down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
  }

  module.exports = {up, down}

/*
| Feature      | Behavior                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------ |
| `teamId`     | Foreign key referencing `teams.id`                                                         |
| `onUpdate`   | **CASCADE** → if a team ID changes, it updates in `users` automatically                    |
| `onDelete`   | **SET NULL** → if a team is deleted, affected users stay but their `teamId` becomes `NULL` |
| ENUM Cleanup | The `down` migration safely drops the `enum_users_role` type for PostgreSQL                |
*/

  /*
  | Field          | Type                            | Description                                   |
| -------------- | ------------------------------- | --------------------------------------------- |
| `id`           | `TEXT` (PK)                     | Unique user ID                                |
| `name`         | `TEXT`                          | Full name                                     |
| `username`     | `TEXT` (unique)                 | Login username                                |
| `password`     | `TEXT`                          | Hashed password                               |
| `role`         | `ENUM('admin','lead','member')` | User role                                     |
| `avatarUrl`    | `TEXT`                          | Profile image URL                             |
| `signatureUrl` | `TEXT`                          | Optional signature image URL                  |
| `teamId`       | `TEXT`                          | Foreign key (optional) to `teams` table       |
| `timestamps`   | Enabled                         | Sequelize-managed `createdAt` and `updatedAt` |
*/