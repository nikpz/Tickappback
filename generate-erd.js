// npm install --save-dev sequelize-erd
const { sequelizeErd } = require("sequelize-erd");
const {Sequelize} = require('sequelize');
const fs = require('fs');
const { sequelize } = require("./models/index.js"); // adjust path to your sequelize instance

// async function MyERD(){
//     await sequelizeErd({ source: sequelize, outputFile: "erd.png" });
//     console.log("✅ ERD generated at erd.png: ", seqERD);
// }
// MyERD();




const db = new Sequelize();
const svg = sequelizeErd({ source: db });
fs.writeFileSync('./erd.svg', svg);

// Writes erd.svg to local path with SVG file from your Sequelize models

// node generate-erd.js



/*
Options
source relative path from project root to js file containing sequelize object with models loaded
destination Where you want your ERD SVG
include Only include the following models
exclude Exclude the following models
format File format. Options are "svg", "dot", "xdot", "plain", "plain-ext", "ps", "ps2", "json", "json0"
engine Layout engine to use, options are "circo", "dot", "fdp", "neato", "osage", "twopi". Default to "circo"
We expose a binary for you to use as a npm script. If you want an erd diagram generated in your project folder every time you commit, add this to your package json.

The source path specifies a js file that must export your Sequelize DB instance. It also needs to load all your models.

{
  "scripts": {
    "erd": "sequelize-erd --source ./path/to/your/sequelize/instance --destination ./erd.svg"
  }
}

*/