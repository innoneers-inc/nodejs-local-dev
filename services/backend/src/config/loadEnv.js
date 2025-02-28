const fs = require("fs");
const yaml = require("js-yaml");

function loadYamlEnv(filepath) {
  try {
    const fileContents = fs.readFileSync(filepath, "utf8");
    const data = yaml.load(fileContents);

    if (data.env_variables) {
      Object.keys(data.env_variables).forEach((key) => {
        process.env[key] = data.env_variables[key];
      });
      console.log("Environment variables loaded from app.yaml");
    } else {
      console.warn("No env_variables found in app.yaml");
    }
  } catch (err) {
    console.error("Error loading app.yaml:", err);
  }
}

module.exports = loadYamlEnv;
