const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const outputPath = path.join(__dirname, "config.js");
const publicConfig = {
  APP_ENV: process.env.APP_ENV || "development",
  API_PROXY_BASE_URL: process.env.API_PROXY_BASE_URL || "/api"
};

const fileContents = `window.APP_CONFIG = Object.freeze(${JSON.stringify(publicConfig, null, 2)});\n`;

fs.writeFileSync(outputPath, fileContents, "utf8");
console.log(`Wrote ${path.basename(outputPath)} with public runtime configuration.`);
