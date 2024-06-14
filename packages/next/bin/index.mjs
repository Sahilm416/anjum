#!/usr/bin/env node
import { Command } from "commander";
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
  .description("Initialize anjum authentication (redshield 2.0)")
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

    // Initialize the project for Neon Postgres
    await initializeProject();
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
        chalk.red("Anjum not detected, install anjum first!")
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
 * Initialize the project for Neon Postgres.
 */
async function initializeProject() {
  const spinner = ora("Initializing project...").start();
  await delay(200); // Small delay for a better user experience

  const plugin = `import { PostgresNeon } from "anjum/plugins";`;
  const fnc = `PostgresNeon()`;
  await initializePostgreNeon(spinner);

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
${plugin}
        
const anjum = new Anjum({
  database: ${fnc},
  name: "Anjum",
});
        
export const {
  register,
  login,
  getSession,
  logout,
  sendEmailVerificationCode,
  verifyEmailVerificationCode,
  deleteAccount,
  resetPassword
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
  let envFileToUpdate;

  for (const envFilePath of envFilePaths) {
    try {
      if (fs.existsSync(path.join(process.cwd(), envFilePath))) {
        const envConfig = dotenv.config({
          path: path.join(process.cwd(), envFilePath),
        });
        neonKey = envConfig.parsed?.NEON_KEY;
        jwtSecret = envConfig.parsed?.JWT_SECRET || null;
        envFileToUpdate = envFilePath;
        if (neonKey) {
          break;
        }
      }
    } catch (err) {
      console.log(chalk.yellow(`Error reading ${envFilePath}: ${err.message}`));
    }
  }

  if (!neonKey) {
    spinner.fail(chalk.redBright("No NEON_KEY found in environment variables!"));
    exit(1);
  }

  if (!jwtSecret) {
    jwtSecret = nanoid() + nanoid();
    if (envFileToUpdate) {
      const envFilePath = path.join(process.cwd(), envFileToUpdate);
      const envContent = fs.readFileSync(envFilePath, "utf-8");
      const newEnvContent = `${envContent}\nJWT_SECRET=${jwtSecret}`;
      fs.writeFileSync(envFilePath, newEnvContent);
      console.log(
        chalk.yellow(
          `JWT_SECRET not found. A new JWT_SECRET has been generated and appended to the ${envFileToUpdate} file.`
        )
      );
    }
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

