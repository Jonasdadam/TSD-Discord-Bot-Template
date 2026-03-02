#!/usr/bin/env node
require("colors");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const https = require("https");

// Configure the GitHub details
const REPO_OWNER = "Jonasdadam"; // Of TheSynxDev
const REPO_NAME = "TSD-Plugins";
const REPO_BRANCH = "main";
const PLUGINS_DIR_IN_REPO = "plugins";

const args = process.argv.slice(2);
const command = args[0];

// --- Helper Functions for Native GitHub Downloads ---
function fetchJson(url) {
	return new Promise((resolve, reject) => {
		https.get(url, { headers: { "User-Agent": "TSD-CLI" } }, (res) => {
			let data = "";
			res.on("data", (chunk) => (data += chunk));
			res.on("end", () => {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					resolve(JSON.parse(data));
				} else {
					reject(new Error(`HTTP ${res.statusCode}: ${data}`));
				}
			});
		}).on("error", reject);
	});
}

function downloadFile(url, dest) {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(dest);
		https.get(url, { headers: { "User-Agent": "TSD-CLI" } }, (res) => {
			if (res.statusCode >= 200 && res.statusCode < 300) {
				res.pipe(file);
				file.on("finish", () => {
					file.close();
					resolve();
				});
			} else {
				reject(new Error(`Failed to download (HTTP ${res.statusCode})`));
			}
		}).on("error", (err) => {
			fs.unlink(dest, () => {});
			reject(err);
		});
	});
}
// ----------------------------------------------------

async function main() {
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
			await installPlugin(pluginName, false);
			break;

		case "update":
		case "u":
			const target = args[1];
			if (target) {
				console.log(`\n[INFO] Updating plugin: ${target}...`.cyan);
				await installPlugin(target, true);
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

async function installPlugin(pluginName, overwrite = false) {
	const tempDir = path.join(__dirname, ".temp_plugin_download");
	const targetSrcDir = path.join(__dirname, "src");

	try {
		if (fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true });
		}
		fs.mkdirSync(tempDir);

		console.log(`[INFO] Fetching plugin data...`.cyan);
		
		// 1. Fetch the entire file tree of the repository
		const treeUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${REPO_BRANCH}?recursive=1`;
		let treeData;
		
		try {
			treeData = await fetchJson(treeUrl);
		} catch (err) {
			throw new Error("Could not fetch repository structure. Ensure the repository is public and not empty.");
		}

		// 2. Filter out only the files that belong to our specific plugin
		const pluginPrefix = `${PLUGINS_DIR_IN_REPO}/${pluginName}/`;
		const pluginFiles = treeData.tree.filter((item) => item.type === "blob" && item.path.startsWith(pluginPrefix));

		if (pluginFiles.length === 0) {
			throw new Error(`Plugin '${pluginName}' does not exist.`);
		}

		console.log(`[INFO] Downloading ${pluginFiles.length} files...`.cyan);

		// 3. Download each file directly
		for (const file of pluginFiles) {
			const relativePath = file.path.substring(pluginPrefix.length);
			const destPath = path.join(tempDir, relativePath);

			fs.mkdirSync(path.dirname(destPath), { recursive: true });

			const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${file.path}`;
			await downloadFile(rawUrl, destPath);
		}

		const pluginSrcPath = path.join(tempDir, "src");

		if (!fs.existsSync(pluginSrcPath)) {
			throw new Error(`Plugin '${pluginName}' does not have a 'src' directory.`);
		}

		console.log(`[INFO] Integrating plugin files into the bot...`.cyan);
		copyFolderRecursiveSync(pluginSrcPath, targetSrcDir, overwrite);

		const pluginPackageJson = path.join(tempDir, "package.json");
		if (fs.existsSync(pluginPackageJson)) {
			console.log(`\n[INFO] Checking additional dependencies...`.cyan);
			const pkgData = JSON.parse(fs.readFileSync(pluginPackageJson, "utf8"));

			if (pkgData.dependencies) {
				const deps = Object.keys(pkgData.dependencies)
					.map((dep) => `${dep}@${pkgData.dependencies[dep]}`)
					.join(" ");

				if (deps) {
					execSync(`npm install ${deps}`, { cwd: __dirname, stdio: "inherit" });
					console.log(`\n[INFO] Installed packages: ${deps}`.cyan);
				}
			}
		}

		console.log(`\n[SUCCESS] Plugin '${pluginName}' has been successfully ${overwrite ? "updated" : "installed"}!\n`.green);
	} catch (error) {
		console.error(`\n[ERROR] Failed to ${overwrite ? "update" : "install"} plugin: ${error.message}\n`.red);
	} finally {
		// Always clean up the temp folder
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

main();