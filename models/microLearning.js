module.exports = (sequelize, DataTypes) => {
  const MicroLearning = sequelize.define(
    "MicroLearning",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      topic: { type: DataTypes.TEXT, allowNull: true },
      generated_text: { type: DataTypes.TEXT, allowNull: true },
      quiz: { type: DataTypes.JSONB, allowNull: true },
    },
    {
      tableName: "micro_learnings",

      //new addsssss
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deletedAt',
      paranoid: true,
      timestamps: false,
    }
  );

  MicroLearning.associate = (models) => {
    MicroLearning.hasMany(models.LearningAssignment, {
      foreignKey: "resource_id",
      constraints: false,
      scope: { resource_type: "MICRO_LEARNING" },
      as: "assignments",
    });
  };

  return MicroLearning;
};
