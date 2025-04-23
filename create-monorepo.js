#!/usr/bin/env node

import inquirer from 'inquirer'
import fs from 'fs-extra'
import chalk from 'chalk'
import path from 'path'
import { execSync } from 'child_process'
import { program, Option } from 'commander' // Import Option here
import { createRequire } from 'module' // To read package.json
import { fileURLToPath } from 'url' // To get __dirname in ES Modules

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// --- Configuration Constants ---
const MONOREPO_URL = 'https://github.com/szig83/monorepo.git'
const DEFAULT_LANG = 'en'
const LOCALES_DIR = path.join(__dirname, 'locales') // Get locales dir relative to this script
const packageJsonPath = path.join(__dirname, 'package.json')
const { version: cliVersion, description: cliDescriptionPackage } = require(packageJsonPath) // Rename to avoid conflict

// --- Translation Helper ---
let translations = {}
let currentLang = DEFAULT_LANG // Set global currentLang

// Simple translation function with placeholder replacement
function t(key, params = {}, fallback = null) {
	let text = translations[key] || fallback || key // Fallback to key if not found
	for (const [paramKey, paramValue] of Object.entries(params)) {
		text = text.replace(`{${paramKey}}`, paramValue)
	}
	return text
}

// Helper function to load translations
async function loadLanguage(lang) {
	const langFilePath = path.join(LOCALES_DIR, `${lang}.json`)
	try {
		translations = await fs.readJson(langFilePath)
		currentLang = lang // Update global lang when loaded
		return lang
	} catch (error) {
		return null // Indicate failure
	}
}

// --- Main Execution Flow --- (Using async IIFE structure)
async function main() {
	// 1. Determine requested language *before* configuring commander
	let initialLang = DEFAULT_LANG
	const langArgIndex = process.argv.findIndex((arg) => arg === '--lang' || arg === '-l')
	if (langArgIndex !== -1 && process.argv.length > langArgIndex + 1) {
		const requestedLangArg = process.argv[langArgIndex + 1]
		// Basic check if it looks like a language code (e.g., not another flag)
		if (!requestedLangArg.startsWith('-')) {
			initialLang = requestedLangArg
		}
	}

	// 2. Load the determined language (or fallback to default)
	if (!(await loadLanguage(initialLang))) {
		// If requested lang failed, load default and warn (only if requested was not default)
		if (initialLang !== DEFAULT_LANG) {
			console.warn(
				chalk.yellow(
					t('unknownLangWarning', { lang: initialLang, defaultLang: DEFAULT_LANG }, DEFAULT_LANG),
				),
			) // Use default t() for warning
			if (!(await loadLanguage(DEFAULT_LANG))) {
				// Fatal if default also fails
				console.error(
					chalk.red(`FATAL: Could not load default language file (${DEFAULT_LANG}). Exiting.`),
				)
				process.exit(1)
			}
		} else {
			// Default language failed to load initially
			console.error(
				chalk.red(`FATAL: Could not load default language file (${DEFAULT_LANG}). Exiting.`),
			)
			process.exit(1)
		}
	}
	// At this point, 'currentLang' holds the correctly loaded language.

	// 3. Configure Commander *after* the correct language is loaded
	// Disable the default help option so we can add our own localized one
	program.helpOption(false)

	program
		.version(cliVersion, '-V, --version', t('versionOptionDesc')) // Pass version string, flags, and description
		.description(t('cliDescription')) // Now t() has translations
		.addOption(
			new Option('-l, --lang <language>', t('langOptionDesc')) // Now t() has translations
				.default(DEFAULT_LANG)
				.choices(['en', 'hu']),
		)
		// Add the help option explicitly with localized description
		.helpOption('-h, --help', t('helpOptionDesc'))
		.parse(process.argv)

	// 4. Run the main application logic
	// Commander exits automatically for --help / -V, so run() only executes otherwise
	await run() // run() no longer needs language loading logic
}

// --- Main Function --- (Becomes the core interactive part)
async function run() {
	console.log(chalk.blue.bold(t('startProcess')))

	let targetDir = ''
	let directoryCreatedByScript = false

	try {
		// --- Step 1: Get User Configuration ---
		console.log(chalk.cyan(t('gatherConfig')))
		const answers = await inquirer.prompt([
			{
				type: 'input',
				name: 'projectName',
				message: t('promptProjectName'),
				// Placeholder, not default. User sees this but needs to type.
			},
			{
				type: 'list',
				name: 'dbType',
				message: t('promptDbType'),
				choices: ['postgresql'], // Extend later with 'mysql'
				default: 'postgresql',
			},
			{
				type: 'input',
				name: 'dbHost',
				message: t('promptDbHost'),
				default: 'localhost',
			},
			{
				type: 'input',
				name: 'dbUser',
				message: t('promptDbUser'),
				validate: (input) => (input ? true : t('errorDbUserEmpty')),
			},
			{
				type: 'password',
				name: 'dbPassword',
				message: t('promptDbPassword'),
				mask: '*',
			},
			{
				type: 'input',
				name: 'dbName',
				message: t('promptDbName'),
				validate: (input) => (input ? true : t('errorDbNameEmpty')),
			},
			{
				type: 'input',
				name: 'dbPort',
				message: t('promptDbPort'),
				default: (ans) => (ans.dbType === 'postgresql' ? '5432' : ''), // Dynamic default
				validate: (input) => {
					const port = parseInt(input, 10)
					return !isNaN(port) && port > 0 && port <= 65535 ? true : t('errorDbPortInvalid')
				},
			},
			{
				type: 'checkbox',
				name: 'authProviders',
				message: t('promptAuthProviders'),
				choices: ['google', 'facebook', 'github'],
			},
			{
				type: 'list',
				name: 'dbInitType',
				message: t('promptDbInitType'),
				// Choices remain hardcoded for now, could be internationalized if needed
				choices: [
					{ name: t('dbInitChoiceNone'), value: 'none' },
					{ name: t('dbInitChoiceSql'), value: 'sql file based' },
					{ name: t('dbInitChoiceSeed'), value: 'seed process' },
				],
				default: 'none', // Make 'none' the default
			},
			{
				// NEW PROMPT for Docker
				type: 'confirm',
				name: 'useDocker',
				message: t('promptUseDocker'), // Key to be added to locale files
				default: false,
				//when: (ans) => ans.dbInitType !== 'none', // Only ask if DB init is planned
			},
			{
				type: 'input',
				name: 'seedUserCount',
				message: t('promptSeedUserCount'),
				default: '0', // Default to 0
				when: (ans) => ans.dbInitType === 'seed process',
				validate: (input) => {
					const count = parseInt(input, 10)
					// Allow 0 or positive integers
					return !isNaN(count) && count >= 0 ? true : t('errorSeedUserCountInvalid')
				},
			},
			{
				type: 'list',
				name: 'packageManager',
				message: t('promptPackageManager'),
				choices: ['npm', 'bun', 'pnpm'], // Keep these technical terms as is
				default: 'npm',
			},
		])

		console.log(chalk.yellow(t('configSummary')))
		console.log(answers) // Log answers for debugging/confirmation
		console.log(chalk.yellow(t('configEnd')))

		// --- Step 2: Prepare Target Directory ---
		console.log(chalk.cyan(t('prepareDir')))
		const projectName = answers.projectName.trim()

		if (projectName) {
			targetDir = path.resolve(process.cwd(), projectName)
			console.log(t('targetDirInfo', { targetDir }))
			if (await fs.pathExists(targetDir)) {
				const files = await fs.readdir(targetDir)
				if (files.length > 0) {
					throw new Error(t('dirExistsNotEmptyError', { projectName }))
				}
				console.log(chalk.yellow(t('dirExistsEmptyWarning', { projectName })))
			} else {
				await fs.ensureDir(targetDir)
				directoryCreatedByScript = true // Mark that we created it
				console.log(chalk.green(t('dirCreated', { targetDir })))
			}
		} else {
			targetDir = process.cwd()
			console.log(t('useCurrentDir', { targetDir }))
			const files = await fs.readdir(targetDir)
			// Allow if only hidden files/dirs like .git exist, but block otherwise
			const visibleFiles = files.filter((f) => !f.startsWith('.'))
			if (visibleFiles.length > 0) {
				throw new Error(t('currentDirNotEmptyError'))
			}
			console.log(chalk.yellow(t('currentDirEmptyWarning')))
		}

		// --- Step 3: Clone Monorepo ---
		console.log(chalk.cyan(t('cloningRepo', { repoUrl: MONOREPO_URL, targetDir })))
		try {
			execSync(`git clone ${MONOREPO_URL} .`, { cwd: targetDir, stdio: 'pipe' }) // Clone into the target dir
			console.log(chalk.green(t('cloningSuccess')))

			// Optional: Remove the .git directory after cloning if the user shouldn't commit to the template repo
			// Consider making this an option later
			console.log(chalk.yellow(t('removingGit')))
			await fs.remove(path.join(targetDir, '.git'))
			console.log(chalk.green(t('removeGitSuccess')))
		} catch (gitError) {
			throw new Error(t('errorCloning', { error: gitError.message }))
		}

		// --- Step 4: Create Config File ---
		console.log(chalk.cyan(t('createDbConfig')))
		const envsDir = path.join(targetDir, 'envs')
		const envFilePath = path.join(envsDir, '.env.database.local')
		const envContent = `DB_HOST=${answers.dbHost}
DB_USER=${answers.dbUser}
DB_PASSWORD=${answers.dbPassword}
DB_NAME=${answers.dbName}
DB_PORT=${answers.dbPort}
`

		try {
			await fs.ensureDir(envsDir) // Ensure envs dir exists (it should from clone)
			await fs.writeFile(envFilePath, envContent)
			console.log(chalk.green(t('createDbConfigSuccess', { envFilePath })))
		} catch (envError) {
			throw new Error(t('errorCreateDbConfig', { error: envError.message }))
		}

		// --- Step 4.5: Copy .env.web.sample ---
		console.log(chalk.cyan(t('copyWebEnv')))
		const webEnvSamplePath = path.join(envsDir, '.env.web.sample')
		const webEnvLocalPath = path.join(envsDir, '.env.web.local')
		try {
			await fs.copy(webEnvSamplePath, webEnvLocalPath)
			console.log(
				chalk.green(t('copyWebEnvSuccess', { src: '.env.web.sample', dest: '.env.web.local' })),
			)
		} catch (copyError) {
			// Don't make this fatal, maybe the sample file doesn't exist, but warn
			console.warn(
				chalk.yellow(
					t('errorCopyWebEnv', {
						src: '.env.web.sample',
						dest: '.env.web.local',
						error: copyError.message,
					}),
				),
			)
		}

		// --- Step 5: Install Dependencies ---
		console.log(chalk.cyan(t('installDeps', { packageManager: answers.packageManager })))
		const installCommand = `${answers.packageManager} install`
		try {
			// Use stdio: 'inherit' to show the installation progress directly to the user
			execSync(installCommand, { cwd: targetDir, stdio: 'inherit' })
			console.log(chalk.green(t('installDepsSuccess')))
		} catch (installError) {
			throw new Error(
				t('errorInstallDeps', {
					packageManager: answers.packageManager,
					error: installError.message,
				}),
			)
		}

		// --- Step 5.5: Run Docker Start (if requested) ---
		const packageManagerPrefixDocker = {
			npm: 'npm',
			bun: 'bun',
			pnpm: 'pnpm',
		}[answers.packageManager]

		if (answers.useDocker) {
			console.log(chalk.cyan(t('runDockerStart')))
			const dockerStartCommand = `${packageManagerPrefixDocker} run docker:start`
			console.log(t('executingCommand', { command: dockerStartCommand }))
			try {
				execSync(dockerStartCommand, { cwd: targetDir, stdio: 'inherit' })
				// Wait 2 seconds after Docker starts
				console.log(chalk.yellow(t('waiting')))
				await new Promise((resolve) => setTimeout(resolve, 2000))
				console.log(chalk.green(t('dockerStartSuccess')))
			} catch (dockerError) {
				// Don't necessarily make this fatal, but report error clearly
				console.error(chalk.red(t('errorDockerStart', { error: dockerError.message })))
				// Optionally ask user if they want to continue? For now, just report and continue.
			}
		}

		// --- Step 6: Run DB Init Scripts ---
		// Only run if an initialization type other than 'none' was selected
		if (answers.dbInitType !== 'none') {
			console.log(chalk.cyan(t('runDbInit', { dbInitType: answers.dbInitType })))

			let dbScriptCommand = ''
			const packageManagerPrefix = {
				npm: 'npm',
				bun: 'bun',
				pnpm: 'pnpm',
			}[answers.packageManager]

			if (answers.dbInitType === 'seed process') {
				const seedCount = answers.seedUserCount // Already validated as positive integer
				// Note: Environment variable passing syntax might differ slightly across shells, but this is common.
				// Ensure the receiving script (db:seed) reads PUBLIC_USER_COUNT.
				dbScriptCommand = `PUBLIC_USER_COUNT=${seedCount} ${packageManagerPrefix} turbo run db:seed`
			} else {
				// 'sql file based'
				dbScriptCommand = `${packageManagerPrefix} turbo run db:restore`
			}

			console.log(t('executingCommand', { command: dbScriptCommand }))
			try {
				execSync(dbScriptCommand, { cwd: targetDir, stdio: 'inherit' })
				console.log(chalk.green(t('dbInitSuccess')))
			} catch (dbScriptError) {
				throw new Error(
					t('errorDbInit', { command: dbScriptCommand, error: dbScriptError.message }),
				)
			}
		} else {
			console.log(chalk.yellow(t('skipDbInit')))
		}

		console.log(chalk.green(t('setupComplete')))
	} catch (error) {
		console.error(
			chalk.red(`
${t('errorDuringSetup')}
${error.message}`),
		)
		// console.error(error.stack); // Optional: for more detailed debugging

		// Cleanup: Remove created directory if an error occurred after its creation
		if (directoryCreatedByScript && targetDir) {
			console.log(chalk.yellow(t('attemptingCleanup', { targetDir })))
			try {
				await fs.remove(targetDir)
				console.log(chalk.green(t('cleanupSuccess')))
			} catch (cleanupError) {
				console.error(chalk.red(t('cleanupFailed', { error: cleanupError.message })))
			}
		}
		process.exit(1)
	}
}

// --- Start the application ---
main().catch((error) => {
	// Catch potential errors during the async setup in main()
	console.error(chalk.red('An unexpected error occurred during initialization:'), error)
	process.exit(1)
})
