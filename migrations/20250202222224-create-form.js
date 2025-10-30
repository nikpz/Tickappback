 async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("forms", {
    id: {
      type: Sequelize.TEXT,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    display_mode: {
      type: Sequelize.ENUM("MULTI_STEP", "SINGLE_PAGE"),
      allowNull: true,
    },
    fields: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
    is_pinned: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    form_code: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    approval_date: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    version: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    unit: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    approval_code: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    next_serial_number: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    category_id: {
      type: Sequelize.TEXT,
      allowNull: true, /*defaultValue: 0,*/
      references: {
        model: "form_categories", // ✅ actual table name
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    // ✅ Foreign keys must exist as columns first
    creator_id: {
      type: Sequelize.TEXT,
      allowNull: false,
      references: {
        model: "users", // ✅ actual table name
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    }
    
  });
  await queryInterface.addConstraint('forms', {
    fields: ['category_id'],
    type: 'foreign key',
    name: 'fk_forms_category_id',
    references: {
      table: 'form_categories', // ✅ tableName, not model name
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
}

 async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("forms");
  // Drop ENUM type explicitly for PostgreSQL cleanup
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_forms_display_mode";'
  );
}
module.exports = {up, down}
