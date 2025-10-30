module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define(
    "Book",
    {
      id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
      title: { type: DataTypes.TEXT, allowNull: true },
      author: { type: DataTypes.TEXT, allowNull: true },
      cover_image_url: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "books",

      //new addsssss
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deletedAt',
      paranoid: true,
      timestamps: false,
    }
  );

  Book.associate = (models) => {
    Book.hasMany(models.LearningAssignment, {
      foreignKey: "resource_id",
      constraints: false,
      scope: { resource_type: "BOOK" },
      as: "assignments",
    });
  };

  return Book;
};
