#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import path from "path";
import dotenv from "dotenv";
import { exit } from "process";
import fs from "fs";
import { initPostgresNeon } from "./init/neon/index.mjs";
import { nanoid } from 'nanoid'

// Initialize the commander program
const program = new Command();

program
  .name(chalk.blue("Anjum"))
  .description("Initialize anjum authentication ( redshield 2.0 )")
  .version("0.0.1");

program
  .command("init")
  .description("Initialize anjum")
  .action(async () => {
    // Check for a valid Next.js project
    const isValidProject = await checkForValidProject();
    if (!isValidProject) {
      console.log(chalk.red("Invalid project. Exiting..."));
      exit(1);
    }

    // Prompt the user to select the database
    const { database } = await inquirer.prompt([
      {
        type: "list",
        name: "database",
        message: chalk.white("Select your database:"),
        choices: ["PostgreNeon", "MongoDB"],
      },
    ]);

    // Initialize the project based on the selected database
    await initializeProject(database);
  });

program.parse(process.argv);

/**
 * Check if the current directory is a valid Next.js project.
 * @returns {Promise<boolean>} True if it's a valid project, false otherwise.
 */
async function checkForValidProject() {
  const spinner = ora("Checking for a valid project...").start();
  await delay(1000); // Small delay for a better user experience

  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    spinner.succeed(chalk.green("Detected package.json file in project."));

    const dependencySpinner = ora("Checking for dependencies...").start();
    await delay(1000); 
    if (!packageJson.dependencies.next) {
      dependencySpinner.fail(
        chalk.red("This SDK is only for Next.js projects!")
      );
      return false;
    }

    if (!packageJson.dependencies.anjum) {
      dependencySpinner.fail(
        chalk.red("Anjum not detected , install anjum first!")
      );
      return false;
    }

    dependencySpinner.succeed(chalk.green("Valid Next.js project detected."));

    const typescriptSpinner = ora("Checking TypeScript...").start();
    await delay(1000); 
    const hasTypescript = !!packageJson.devDependencies.typescript;
    typescriptSpinner.succeed(
      hasTypescript
        ? chalk.green("TypeScript detected ✅")
        : chalk.yellow("No TypeScript detected ❌")
    );

    return true;
  } catch (error) {
    spinner.fail(chalk.red("No package.json file detected!"));
    return false;
  }
}

/**
 * Initialize the project based on the selected database.
 * @param {string} database - The selected database option.
 */
async function initializeProject(database) {
  const spinner = ora("Initializing project...").start();
  await delay(200); // Small delay for a better user experience
  let plugin = "";
  let fnc = "";
  switch (database) {
    case "PostgreNeon":
      plugin = `import { PostgresNeon } from "anjum/plugins;`;
      fnc = `PostgresNeon()`;
      await initializePostgreNeon(spinner);
      break;

    case "MongoDB":
      spinner.succeed(
        `You selected ${chalk.green(database)} as your database.`
      );
      break;
    default:
      spinner.fail("Invalid database option selected.");
  }

  const srcFolder = path.join(process.cwd(), "src");
  const actionsFolder = path.join(srcFolder, "actions");
  const shouldCreateActionsInSrc = fs.existsSync(srcFolder);

  if (shouldCreateActionsInSrc) {
    // Create the 'actions' folder inside 'src'
    fs.mkdirSync(actionsFolder, { recursive: true });
  } else {
    // Create the 'actions' folder in the current directory
    const actionsFolder = path.join(process.cwd(), "actions");
    fs.mkdirSync(actionsFolder, { recursive: true });
  }

  // Detect TypeScript presence
  const packageJsonPath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const hasTypescript = !!packageJson.devDependencies.typescript;

  // Create the 'anjum' file based on TypeScript presence
  const anjumFilePath = path.join(
    shouldCreateActionsInSrc
      ? actionsFolder
      : path.join(process.cwd(), "actions"),
    hasTypescript ? "anjum.ts" : "anjum.js"
  );
  fs.writeFileSync(
    anjumFilePath,
    `"use server";
import { Anjum } from "anjum";
${plugin}";
        
const anjum = new Anjum({
  database: ${fnc} ,
  name: "Anjum",
});
        
export const {
  register,
  login,
  getSession,
  logout,
  sendEmailVerificationCode,
  verifyEmailVerificationCode,
} = anjum;`
  );

  spinner.succeed(
    chalk.green(
      `Successfully created the 'actions' folder and '${path.basename(anjumFilePath)}' file.`
    )
  );
}

async function initializePostgreNeon(spinner) {
  const envFilePaths = [".env", ".env.local"];
  let neonKey;
  let jwtSecret;

  for (const envFilePath of envFilePaths) {
    try {
      const envConfig = dotenv.config({
        path: path.join(process.cwd(), envFilePath),
      });
      neonKey = envConfig.parsed?.NEON_KEY;
      jwtSecret = envConfig.parsed?.JWT_SECRET || null;
      if (neonKey) {
        break;
      }
    } catch (err) {
      spinner.fail(err.message);
    }
  }

  if (!neonKey) {
    console.log(chalk.redBright("No NEON_KEY found in environment variables!"));
    spinner.fail("Failed to initialize project");
    exit(1);
  }

  if (!jwtSecret) {
    jwtSecret = nanoid() + nanoid();
    const envFilePath = path.join(process.cwd(), ".env");
    const envContent = fs.readFileSync(envFilePath, "utf-8");
    const newEnvContent = `${envContent}\nJWT_SECRET=${jwtSecret}`;
    fs.writeFileSync(envFilePath, newEnvContent);
    console.log(
      chalk.yellow(
        `JWT_SECRET not found. A new JWT_SECRET has been generated and appended to the .env file.`
      )
    );
  }

  spinner.succeed(
    chalk.green(
      "Detected a NEON_KEY and JWT_SECRET in environment variables."
    )
  );

  const tableSpinner = ora(
    "Initializing required tables in PostgreSQL..."
  ).start();
  await delay(1000);
  const res = await initPostgresNeon(neonKey);
  if (res.success) {
    tableSpinner.succeed(
      chalk.green("Successfully initialized required tables in PostgreSQL.")
    );
  } else {
    tableSpinner.fail(res.message);
    exit(1);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
