const path = require("path");
const getAllFiles = require("./getAllFiles");

module.exports = (exceptions = []) => {
	let modals = [];
	const basePath = path.join(__dirname, "..", "..", "modals");

	const allFiles = getAllFiles(basePath);

	const categories = getAllFiles(basePath, true);
	for (const category of categories) {
		const categoryFiles = getAllFiles(category);
		allFiles.push(...categoryFiles);
	}

	for (const file of allFiles) {
		const modalObject = require(file);

		if (exceptions.includes(modalObject.name || modalObject.customId)) continue;
		modals.push(modalObject);
	}

	return modals;
};