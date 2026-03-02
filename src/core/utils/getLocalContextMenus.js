const path = require("path");
const getAllFiles = require("./getAllFiles");

module.exports = (exceptions = []) => {
	let localContextMenus = [];
	const basePath = path.join(__dirname, "..", "..", "contextmenus");

	const allFiles = getAllFiles(basePath);

	const categories = getAllFiles(basePath, true);
	for (const category of categories) {
		const categoryFiles = getAllFiles(category);
		allFiles.push(...categoryFiles);
	}

	for (const file of allFiles) {
		const menuObject = require(file);

		if (exceptions.includes(menuObject.data?.name || menuObject.name)) continue;
		localContextMenus.push(menuObject);
	}

	return localContextMenus;
};