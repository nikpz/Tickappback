// models/process.js
module.exports = (sequelize, DataTypes) => {
  const Process = sequelize.define(
    "Process",
    {
      id: {
        type: DataTypes.TEXT,
        allowNull: false,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      icon: DataTypes.STRING,
      color: DataTypes.STRING,
      description: DataTypes.TEXT,
      unit: DataTypes.STRING,
      variableIds: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true,
        defaultValue: [],
      },
      owner_id: {
        type: DataTypes.TEXT,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    },
    {
      tableName: "processes",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deletedAt",
      paranoid: true,
      timestamps: true,

    }
  );

//   Process.associate = (models) => {
    // if variables are a model, add relation:
    // Process.hasMany(models.Variable, { foreignKey: "process_id", as: "variables" });
//   };
  Process.associate = (models) => {
    // Process has many Variables !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    Process.hasMany(models.Variable, {
      foreignKey: "process_id",
      as: "variables",
    });
  
    // Process belongs to a User (owner)
    Process.belongsTo(models.User, {
      foreignKey: "owner_id",
      as: "owner",
    });
  
    // Optional: link to Strategy or other entities
    Process.belongsTo(models.Strategy, {
      foreignKey: "strategy_id",
      as: "strategy",
    });
  };

  return Process;
};

/*
You can’t do include: [{ model: models.User, as: "owner" }]
Queries like your submissions:list won’t include related data (like owner info, variables, or linked forms)

✅ Notice the pattern:
belongsTo → used when a model has a foreign key pointing to another model (owner_id → User)
hasMany → used when a model “owns” multiple child records (Process → Variables)
include → allows findAll or findByPk to fetch related entities
*/
