# AI Task Description: Create Monorepo CLI Installer

## 1. Goal

Create a command-line interface (CLI) application using Node.js (`#!/usr/bin/env node`), capable of running in both Node.js (>= 18) and Bun environments. The purpose of the CLI is to initialize the `https://github.com/szig83/monorepo` project based on configuration provided interactively by the user.
The application supports a multilingual interface (English and Hungarian) and provides command-line options (`--version`, `--help`, `--lang`).

## 2. Runtime Environment and Packages

*   **Runtime:** Node.js (recommended version: >= 18) and Bun.
*   **Coding Style:** Use modern JavaScript syntax (ESM modules, `async/await`).
*   **Core Packages:**
    *   `commander`: For handling CLI arguments and options (`--version`, `--help`, `--lang`).
    *   `inquirer`: For asking interactive command-line questions to the user.
    *   `fs-extra`: For robust filesystem operations (creating directories, writing files, deleting on error).
    *   `chalk`: For providing colorful and styled output in the terminal ("modern" UI).
*   **Project Structure:**
    *   `create-monorepo.js`: The main executable script.
    *   `locales/`: Directory containing language files (`en.json`, `hu.json`).
    *   `package.json`: Project metadata and dependencies.

## 3. Command-Line Options (`commander`)

*   `-V, --version`: Prints the current version number of the application (from `package.json`) and exits.
*   `-h, --help`: Displays the help message (with available options) and exits.
*   `-l, --lang <language>`: Specifies the language used by the CLI. Available values: `en` (English), `hu` (Hungarian). Default: `en`.

## 4. Interactive Prompt Process (`inquirer`)

If the program doesn't exit due to the `--version` or `--help` flag, it will ask the following questions sequentially in the selected language (see `-l, --lang`):

1.  **Project name:**
    *   Type: `input`
    *   Message: "What should the project name be? (Leave empty for the current directory)"
    *   Default (placeholder): `my-project`
    *   Function: This will be the target directory name. If the user provides a value, create this directory. If left empty, use the current working directory (`process.cwd()`) as the target.
2.  **Database type:**
    *   Type: `list` (single choice)
    *   Message: "Choose a database type:"
    *   Options: `['postgresql']` (Note: Prepared for future expansion with `mysql`)
    *   Validation: At least one option must be selected.
3.  **Database host:**
    *   Type: `input`
    *   Message: "Database host:"
    *   Default: `localhost`
4.  **Database username:**
    *   Type: `input`
    *   Message: "Database username:"
    *   Validation: Cannot be empty.
5.  **Database password:**
    *   Type: `password` (masked input)
    *   Message: "Database password:"
6.  **Database name:**
    *   Type: `input`
    *   Message: "Database name:"
    *   Validation: Cannot be empty.
7.  **Database port:**
    *   Type: `input`
    *   Message: "Database port:"
    *   Default: `5432` (Dynamically set this if the answer to question 2 is 'postgresql'. Other defaults might be used for other types later.)
    *   Validation: Must be a valid number.
8.  **Application authentication providers:**
    *   Type: `checkbox` (multiple choices)
    *   Message: "Choose authentication providers (space to select, enter to proceed):"
    *   Options: `['google', 'facebook', 'github']`
9.  **Database initialization type:**
    *   Type: `list` (single choice)
    *   Message: "How should we initialize the database?"
    *   Options: `['Based on SQL file', 'With seed process']`
10. **Number of sample users (conditional question):**
    *   Only ask if the answer to question 9 is `'With seed process'`.
    *   Type: `input`
    *   Message: "How many sample users should we create?"
    *   Default: `10`
    *   Validation: Must be a valid positive integer.
11. **Package manager:**
    *   Type: `list` (single choice)
    *   Message: "Which package manager should we use?"
    *   Options: `['npm', 'bun', 'pnpm']`

## 5. Sequence of Tasks to Execute

1.  **Prepare Target Directory:**
    *   Determine the target directory path based on the answer to prompt 1.
    *   If the answer is not empty, create the directory (`fs-extra.ensureDir`). If it already exists and is not empty, report an error and stop.
    *   If the answer is empty, use the current directory. Check if it's empty. If not, report an error and stop.
    *   Use `chalk` to inform the user (e.g., "Creating target directory: <path>...").
2.  **Download Monorepo:**
    *   Clone the contents of the `https://github.com/szig83/monorepo` repository into the target directory. Use a reliable method (e.g., running `git clone` command via `child_process.execSync` or similar).
    *   Provide feedback on the cloning status (`chalk`, optionally a spinner like `ora`).
3.  **Create Configuration File:**
    *   Find the `envs` subdirectory within the target directory.
    *   In this `envs` directory, create a file named `.env.database.local` (`fs-extra.writeFile`).
    *   The file content should be as follows, where values come from the answers to prompts 3-7:
        ```dotenv
        DB_HOST={prompt_3_answer}
        DB_USER={prompt_4_answer}
        DB_PASSWORD={prompt_5_answer}
        DB_NAME={prompt_6_answer}
        DB_PORT={prompt_7_answer}
        ```
    *   Provide feedback on file creation.
4.  **Install Dependencies:**
    *   In the root of the target directory, run the appropriate installation command based on the package manager selected in prompt 11:
        *   `npm`: `npm install`
        *   `bun`: `bun install`
        *   `pnpm`: `pnpm install`
    *   Use `child_process` to run the command. Display the output or use a spinner to indicate progress.
5.  **Run Database Initialization Scripts:**
    *   In the root of the target directory, run the appropriate `turbo run` command based on the answer to prompt 9:
        *   If the answer is `'With seed process'`:
            *   Run: `{package_manager_prefix} turbo run db:seed`
            *   When running the command, pass the value from prompt 10 as an environment variable. Define the environment variable name: `SEED_USER_COUNT`. Example (for `npm`): `SEED_USER_COUNT={prompt_10_answer} npx turbo run db:seed`. The `{package_manager_prefix}` should be `npx`, `bunx`, or `pnpm` based on prompt 11.
        *   If the answer is `'Based on SQL file'`:
            *   Run: `{package_manager_prefix} turbo run db:restore`
    *   Use `child_process` and provide feedback on the success/failure of the execution.

## 6. Error Handling and Cleanup

*   At each step (directory creation, cloning, file writing, command execution), check for success.
*   In case of failure at any step:
    *   Print a clear error message using `chalk.red()`, naming the failed step and, if possible, the cause of the error.
    *   **Important:** If the CLI *created* the target directory (i.e., the answer to prompt 1 was not empty), attempt to remove the entire contents of the created target directory (`fs-extra.remove`) on error. Print a message about the cleanup.
    *   Terminate the CLI execution with an error code (`process.exit(1)`).

## 7. Internationalization

*   The application supports multiple languages using JSON files (`en.json`, `hu.json`) located in the `locales` directory.
*   The language can be selected using the `-l, --lang` flag (default: `en`).
*   The `t(key, params)` helper function is responsible for looking up the correct language keys and substituting any parameters.
*   The help and version information generated by `commander` are also displayed in the selected language.

## 8. User Experience (UI/UX)

*   Use `chalk` to differentiate between different types of messages (e.g., `chalk.blue` for information, `chalk.green` for successful operations, `chalk.yellow` for warnings, `chalk.red` for errors).
*   Provide clear feedback on the start and completion of each major step.
*   Optionally, use spinners (`ora` package) during long-running operations (cloning, installation, script execution) to improve user experience.
*   Messages are displayed in the language chosen by the user.
