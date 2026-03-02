#!/usr/bin/env node
require("colors");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const REPO_URL = "https://github.com/TheSynxDev/tsd-plugins.git";
const PLUGINS_DIR_IN_REPO = "plugins";

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
	case "help":
	case undefined:
		showHelp();
		break;

	case "install":
	case "i":
		const pluginName = args[1];
		if (!pluginName) {
			console.error("\n[ERROR] Please provide a plugin name.".red);
			console.log("Usage:\ntsd install <plugin-name>\nor\ntsd i <plugin-name>\n".yellow);
			process.exit(1);
		}
		installPlugin(pluginName, false);
		break;
	
	case "update":
	case "u":
		const target = args[1];
		if (target) {
			console.log(`\n[INFO] Updating plugin: ${target}...`.cyan);
			installPlugin(target, true); // Set overwrite to true for updating plugins
		} else {
			console.error("\n[ERROR] Please provide a plugin name.".red);
			console.log("Usage:\ntsd update <plugin-name>\nor\ntsd u <plugin-name>\n".yellow);
			process.exit(1);
		}
		break;
	default:
		console.error(`\n[ERROR] Unknown command: ${command}`.red);
		showHelp();
		break;
}

function showHelp() {
	console.log(`
TSD CLI - TheSynxDev

Usage: tsd <command> [options]

Commands:

help               		Shows this help menu
i <plugin-name>   		Installs a plugin from TSD
install <plugin-name>   	Installs a plugin from TSD
u <plugin-name>      		Updates a specific plugin (overwrites existing files)
update <plugin-name>    	Updates a specific plugin (overwrites existing files)
`.cyan);
}

function installPlugin(pluginName, overwrite = false) {
	const tempDir = path.join(__dirname, ".temp_plugin_download");
	const targetSrcDir = path.join(__dirname, "src");

	try {
		if (fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true });
		}
		fs.mkdirSync(tempDir);

		console.log(`[INFO] Downloading plugin files...`.cyan);
		execSync(`git clone --depth 1 --filter=blob:none --sparse ${REPO_URL} "${tempDir}"`, { stdio: "ignore" });
		execSync(`git sparse-checkout set ${PLUGINS_DIR_IN_REPO}/${pluginName}`, { cwd: tempDir, stdio: "ignore" });

		const pluginPath = path.join(tempDir, PLUGINS_DIR_IN_REPO, pluginName);

		if (!fs.existsSync(pluginPath)) {
			throw new Error(`Plugin '${pluginName}' does not exist.`);
		}

		const pluginSrcPath = path.join(pluginPath, "src");

		if (!fs.existsSync(pluginSrcPath)) {
			throw new Error(`Plugin '${pluginName}' does not have a 'src' directory.`);
		}

		console.log(`[INFO] Integrating plugin files into the bot...`.cyan);
		copyFolderRecursiveSync(pluginSrcPath, targetSrcDir, overwrite);

		const pluginPackageJson = path.join(pluginPath, "package.json");
		if (fs.existsSync(pluginPackageJson)) {
			console.log(`[INFO] Checking additional dependencies...`.cyan);
			const pkgData = JSON.parse(fs.readFileSync(pluginPackageJson, "utf8"));

			if (pkgData.dependencies) {
				const deps = Object.keys(pkgData.dependencies)
					.map((dep) => `${dep}@${pkgData.dependencies[dep]}`)
					.join(" ");

				if (deps) {
					execSync(`npm install ${deps}`, { cwd: __dirname, stdio: "inherit" });
				}
			}
		}

		console.log(`\n[SUCCESS] Plugin '${pluginName}' has been successfully ${overwrite ? "updated" : "installed"}!\n`.green);
	} catch (error) {
		console.error(`\n[ERROR] Failed to ${overwrite ? "update" : "install"} plugin: ${error.message}\n`.red);
	} finally {
		if (fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true });
		}
	}
}

function copyFolderRecursiveSync(source, target, overwrite = false) {
	if (!fs.existsSync(target)) {
		fs.mkdirSync(target, { recursive: true });
	}

	const files = fs.readdirSync(source);

	for (const file of files) {
		const currentSource = path.join(source, file);
		const currentTarget = path.join(target, file);

		if (fs.lstatSync(currentSource).isDirectory()) {
			copyFolderRecursiveSync(currentSource, currentTarget, overwrite);
		} else {
			if (fs.existsSync(currentTarget)) {
				if (overwrite) {
					fs.copyFileSync(currentSource, currentTarget);
					console.log(`  -> Updated: ${path.relative(__dirname, currentTarget)}`.blue);
				} else {
					console.log(`  [WARNING] File already exists, skipping: ${path.relative(__dirname, currentTarget)}`.yellow);
				}
			} else {
				fs.copyFileSync(currentSource, currentTarget);
				console.log(`  -> Added: ${path.relative(__dirname, currentTarget)}`.green);
			}
		}
	}
}