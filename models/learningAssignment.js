module.exports = (sequelize, DataTypes) => {
  const LearningAssignment = sequelize.define(
    "LearningAssignment",
    {
      id: { type: DataTypes.TEXT, primaryKey: true },
      assignee_id: { type: DataTypes.TEXT, allowNull: false },
      assigner_id: { type: DataTypes.TEXT, allowNull: false },
      resource_id: { type: DataTypes.TEXT, allowNull: false },
      resource_type: {
        type: DataTypes.ENUM(
          "BOOK",
          "MICRO_LEARNING",
          "YOUTUBE_VIDEO",
          "PODCAST",
          "COURSE"
        ),
        allowNull: false,
      },
      assigned_at: { type: DataTypes.DATE, allowNull: false },
      status: {
        type: DataTypes.ENUM("ASSIGNED", "COMPLETED"),
        allowNull: false,
      },
      completed_at: { type: DataTypes.DATE, allowNull: true },
      trigger_objective_id: { type: DataTypes.TEXT, allowNull: true },
      trigger_feedback_id: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "learning_assignments",

      //new addsssss
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deletedAt",
      paranoid: true,
      timestamps: false,
    }
  );

  LearningAssignment.associate = (models) => {
    LearningAssignment.belongsTo(models.User, {
      foreignKey: "assignee_id",
      as: "assignee",
    });
    LearningAssignment.belongsTo(models.User, {
      foreignKey: "assigner_id",
      as: "assigner",
    });

    // LearningAssignment.belongsTo(models.Objective, {
    //   foreignKey: "trigger_objective_id",
    //   as: "triggerObjective",
    // });

    // Resource polymorphic relation
    LearningAssignment.belongsTo(models.Book, {
      foreignKey: "resource_id",
      /*If you don’t disable constraints, Sequelize tries to create a foreign key constraint 
      between learning_assignments.resource_id and both books.id and micro_learnings.id, 
      which is impossible — one column can’t reference two different tables.
      you tell Sequelize not to enforce any DB-level foreign key constraint, 
      and instead handle the relation at the application (ORM) level.
      */
      constraints: false,
      scope: { resource_type: "BOOK" },
      as: "bookResource",
    });
    LearningAssignment.belongsTo(models.MicroLearning, {
      foreignKey: "resource_id",
      constraints: false,
      scope: { resource_type: "MICRO_LEARNING" },
      as: "microLearningResource",
    });
    LearningAssignment.belongsTo(models.YouTubeVideo, {
      foreignKey: "resource_id",
      constraints: false,
      as: "youTubeVideo",
    });
    LearningAssignment.belongsTo(models.Podcast, {
      foreignKey: "resource_id",
      constraints: false,
      scope: { resource_type: "PODCAST" },
      as: "podcastResource",
    });

    LearningAssignment.belongsTo(models.Course, {
      foreignKey: "resource_id",
      constraints: false,
      scope: { resource_type: "COURSE" },
      as: "courseResource",
    });
  };

  return LearningAssignment;
};


/*
Note: after changing enum values you may need to run a migration to update the database enum (if using Postgres). 
If you can’t modify enum easily, consider using a STRING and enforce valid types at the application level — but enum is preferable.
*/