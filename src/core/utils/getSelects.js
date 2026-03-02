const path = require("path");
const getAllFiles = require("./getAllFiles");

module.exports = (exceptions = []) => {
	let selects = [];
	const basePath = path.join(__dirname, "..", "..", "selects");

	const allFiles = getAllFiles(basePath);

	const categories = getAllFiles(basePath, true);
	for (const category of categories) {
		const categoryFiles = getAllFiles(category);
		allFiles.push(...categoryFiles);
	}

	for (const file of allFiles) {
		const selectObject = require(file);

		if (exceptions.includes(selectObject.name || selectObject.customId)) continue;
		selects.push(selectObject);
	}

	return selects;
};