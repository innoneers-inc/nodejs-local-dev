/* eslint-disable no-console */
const dotenv = require("dotenv");
const util = require("util");
const fs = require("fs").promises;
const path = require("path");
const assert = require("assert");

const JOB_NAME = "setup";

const exec = util.promisify(require("child_process").exec);

const args = util.parseArgs({
  options: {
    env: { type: "string", short: "e", default: "dev" },
    db: { type: "string", short: "d", default: "remote" },
  },
});

const DB_TYPE = {
  LOCAL: "local",
  REMOTE: "remote",
};

const env = args.values.env;
assert(env, "env is required");

const ROOT_PATH = path.join(__dirname, "..");
const LOCAL_ENV = path.join(ROOT_PATH, ".local.env");

const execJson = async (arg) => {
  console.log(arg);
  return await exec(arg).then((r) => {
    try {
      if (r.stderr) {
        console.log(r.stderr);
      }
      return JSON.parse(r.stdout);
    } catch (err) {
      return;
    }
  });
};

const copyFile = (source, target) => {
  return new Promise((resolve, reject) => {
    const rd = fs.createReadStream(source);
    rd.on("error", reject);
    const wr = fs.createWriteStream(target);
    wr.on("error", reject);
    wr.on("close", resolve);
    rd.pipe(wr);
  });
};

const copyAssetsEnvFileToService = (env, serviceName) => {
  const source = path.join(ROOT_PATH, `assets/secrets/.${env}.env`);
  const target = path.join(ROOT_PATH, `services/${serviceName}/.env`);
  return copyFile(source, target);
};

const setEnvValue = async (env, serviceName, values) => {
  const targetPath = path.join(ROOT_PATH, `services/${serviceName}/.env`);
  const file = await fs.readFile(targetPath, "utf8");

  const newFile = Object.keys(values).reduce((acc, key) => {
    // ^ Matches the start of a line due to the 'm' multiline flag
    // = Matches the literal equal sign character
    // .+ Matches any set of characters except for newlines
    return file.replace(new RegExp(`^${key}=.+`, "m"), `${key}=${values[key]}`);
  }, file);

  return fs.writeFile(targetPath, newFile);
};

const setupEnvService = async ({ env, db }, variables, serviceName) => {
  const { DB_URL, DB_NAME } = variables;
  await copyAssetsEnvFileToService(env, serviceName);
  if (db === DB_TYPE.LOCAL) {
    const [, queryParams] = DB_URL.split(DB_NAME);
    await setEnvValue(env, serviceName, {
      DB_URL: `mongodb://127.0.0.1:27018/${DB_NAME}${queryParams}&directConnection=true`,
    });
  }
};

const setupRootEnv = async ({ env }) => {
  const source = path.join(ROOT_PATH, `assets/secrets/.${env}.env`);
  const target = path.join(ROOT_PATH, ".env");
  return copyFile(source, target);
};

const configEnv = async (env) => {
  const target = path.join(ROOT_PATH, `assets/secrets/.${env}.env`);
  return dotenv.config({ path: target }).parsed;
};

const setupMongoDump = async ({ DB_URL }) => {
  await execJson(
    `cd ${ROOT_PATH} && docker exec custom-mongodb sh -c 'mongodump --uri "${DB_URL}" --tlsInsecure --excludeCollection logstrings --archive' > db.dump`
  );
};

const restoreMongoDump = async ({ DB_NAME }) => {
  await execJson(
    `cd ${ROOT_PATH} && docker exec -i custom-mongodb sh -c 'mongorestore --drop --nsInclude ${DB_NAME}.* --archive' < db.dump`
  );
};

const setupLocalDockerCompose = async ({ db }, variables) => {
  await execJson(
    `cd ${ROOT_PATH} && docker compose --env-file ${LOCAL_ENV} -f docker-compose.local.yml up -d --build`
  );
  if (db === DB_TYPE.LOCAL) {
    await setupMongoDump(variables);
    await restoreMongoDump(variables);
  }
};

const main = async (params) => {
  const variables = await configEnv(params.env);
  await setupRootEnv(params);
  await setupLocalDockerCompose(params, variables);
  await Promise.all([
    setupEnvService(params, variables, "backend"),
    setupEnvService(params, variables, "frontend"),
  ]);
};

main(args.values).then(
  () => {
    console.info(`\x1b[32m${JOB_NAME} is DONE\x1b[0m`);
    process.exit(0);
  },
  (e) => {
    console.error(`\x1b[31m${JOB_NAME} is FAILED\x1b[0m`, e);
    process.exit(1);
  }
);
