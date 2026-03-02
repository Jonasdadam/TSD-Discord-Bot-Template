const path = require("path");
const getAllFiles = require("./getAllFiles");

module.exports = (exceptions = []) => {
	let buttons = [];
	const basePath = path.join(__dirname, "..", "..", "buttons");

	const allFiles = getAllFiles(basePath);

	const categories = getAllFiles(basePath, true);
	for (const category of categories) {
		const categoryFiles = getAllFiles(category);
		allFiles.push(...categoryFiles);
	}

	for (const file of allFiles) {
		const buttonObject = require(file);

		if (exceptions.includes(buttonObject.name || buttonObject.customId)) continue;
		buttons.push(buttonObject);
	}

	return buttons;
};