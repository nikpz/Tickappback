require("dotenv").config(); // optional if you use .env
const { Sequelize, DataTypes } = require("sequelize");
const pg = require("pg");
const fs = require("fs");
const path = require("path");
// const  { fileURLToPath } = require("url");

const url = process.env.DATABASE_URL;
const logging = process.env.LOG_QUERIES === "true" ? console.log : false;
if (!url) {
  console.error(
    "DATABASE_URL not set in env. Example: postgres://user:pass@localhost:5432/dbname"
  );
  process.exit(1);
}

// // Detect environment (ESM or CJS)
// const isESM = typeof import.meta !== "undefined" && import.meta.url;
// const __filename = isESM ? fileURLToPath(import.meta.url) : __filename;
// const __dirname = isESM ? path.dirname(__filename) : __dirname;
const basename = path.basename(__filename);
const sequelize = new Sequelize(url, {
  dialect: "postgres",
  dialectModule: pg,
  logging,
});

const models = {};

// Read all model files in this directory except index.js
fs.readdirSync(__dirname)
  // .filter(file => file.endsWith('.js') && file !== 'index.js')
  .filter((file) => file !== basename && file.endsWith(".js"))
  .forEach((file) => {
    const modelDef = require(path.join(__dirname, file));
    console.log("Loading model from", file, "->", typeof modelDef);
    // Handle both export styles (module.exports or module.exports.default)
    // const modelFactory = modelDef.default || modelDef;

    // Some safety checks
    // if (typeof modelFactory === 'function') {
    if (typeof modelDef === "function") {
      const model = modelDef(sequelize, DataTypes);
      models[model.name] = model;
    } else {
      console.warn(`⚠️ Skipped ${file}: not a valid Sequelize model`);
    }
  });

// Run associations if defined
Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;
module.exports = {
  sequelize,
  Sequelize,
  models,
};

/*
// Load all model files
const modelFiles = fs
  .readdirSync(__dirname)
  .filter(
    (file) =>
      file !== "index.js" &&
      file !== "index.cjs" &&
      file !== "index.mjs" &&
      file.endsWith(".js")
  );
  for (const file of modelFiles) {
    const fullPath = path.join(__dirname, file);
  
    let modelDef;
    if (isESM) {
      // ESM dynamic import
      modelDef = (await import(fullPath)).default;
    } else {
      // CommonJS require
      modelDef = require(fullPath);
      if (modelDef.default) modelDef = modelDef.default; // handle hybrid transpilation
    }
    if (typeof modelDef === "function") {
      const model = modelDef(sequelize, DataTypes);
      models[model.name] = model;
    } else {
      console.warn(`⚠️ Skipped ${file}: not a valid model export`);
    }
}
// Run associations safely
for (const model of Object.values(models)) {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
}
// // // Load all model files dynamically
// // fs.readdirSync(__dirname)
// //   .filter(file => file !== 'index.js' && file.endsWith('.js'))
// //   .forEach(file => {
// //     const modelDef = require(path.join(__dirname, file));
// //     const model = modelDef(sequelize, DataTypes);
// //     models[model.name] = model;
// //   });
// //You already called it once with (sequelize, DataTypes) on the first line,
// //so now User holds the defined Sequelize model, not a function anymore.
// // const User = require('./user')(sequelize, DataTypes);
// // const Team = require('./team')(sequelize, DataTypes);
// // const TeamMember = require('./teamMember')(sequelize, DataTypes);
// // const Objective = require('./objective')(sequelize, DataTypes);
// // const keyResult = require('./keyResult')(sequelize, DataTypes);
// // const KRCheckin = require('./krCheckin')(sequelize, DataTypes);
// // const Task = require('./task')(sequelize, DataTypes);
// // const FormCategory = require('./formCategory')(sequelize, DataTypes);
// // const Form = require('./form')(sequelize, DataTypes);
// // const FormSubmission = require('./formSubmission')(sequelize, DataTypes);
// // const DocumentStatus = require('./documentStatus')(sequelize, DataTypes);
// // const Document = require('./document')(sequelize, DataTypes);
// // const MicroLearning = require('./microLearning')(sequelize, DataTypes);
// // const YouTubeVideo = require('./youTubeVideo')(sequelize, DataTypes);
// // const Book = require('./book')(sequelize, DataTypes);
// // const LearningAssignment = require('./learningAssignment')(sequelize, DataTypes);
// // const FeedbackTag = require('./feedbackTag')(sequelize, DataTypes);
// // const KanbanColumn = require('./KanbanColumn')(sequelize, DataTypes);

// // const Ticket = require('./ticket')(sequelize, DataTypes);
// // const Message = require('./message')(sequelize, DataTypes);

// // const models = {
// //   User: User,
// //   Team: Team,
// //   TeamMember: TeamMember,
// //   Objective: Objective,
// //   KeyResult: keyResult,
// //   KRCheckin: KRCheckin,
// //   Task: Task,
// //   FormCategory: FormCategory,
// //   Form: Form,
// //   FormSubmission: FormSubmission,
// //   DocumentStatus: DocumentStatus,
// //   Document: Document,
// //   MicroLearning: MicroLearning,
// //   YouTubeVideo: YouTubeVideo,
// //   Book: Book,
// //   LearningAssignment: LearningAssignment,
// //   FeedbackTag: FeedbackTag,
// //   KanbanColumn: KanbanColumn,
// //   Ticket: Ticket,
// //   Message: Message,
// // };

// // // Run all associations
// // Object.values(models).forEach(model => {
// //   if (model.associate) model.associate(models);
// // });
// // Run all associations safely
// Object.values(models).forEach(model => {
//   if (typeof model.associate === 'function') {
//     model.associate(models);
//   }
// });

// module.exports = { sequelize, models: { User, Ticket, Message } };
module.exports = { sequelize, models };
*/

/*
| Step                           | What it does                                            |
| ------------------------------ | ------------------------------------------------------- |
| 1️⃣ Detects environment        | Checks whether the app is using **ESM** or **CommonJS** |
| 2️⃣ Loads all models           | Reads every `.js` file in `/models` (except `index.js`) |
| 3️⃣ Handles both export styles | Supports both `export default` and `module.exports`     |
| 4️⃣ Initializes models         | Calls `(sequelize, DataTypes)` for each file            |
| 5️⃣ Runs associations          | Calls `model.associate(models)` safely if it exists     |
| 6️⃣ Exports                    | Provides both named and default exports for flexibility |

*/

/*
// Associations (defined on models..!!)
User.hasMany(Ticket, { foreignKey: 'userId' });
Ticket.belongsTo(User, { foreignKey: 'userId' });

Ticket.hasMany(Message, { foreignKey: 'ticketId' });
Message.belongsTo(Ticket, { foreignKey: 'ticketId' });

User.hasMany(Message, { foreignKey: 'userId' });
Message.belongsTo(User, { foreignKey: 'userId' });
*/
