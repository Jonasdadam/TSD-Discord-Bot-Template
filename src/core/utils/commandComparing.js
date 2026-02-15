const { ApplicationCommandType } = require("discord.js");

module.exports = (existing, local) => {
	const localData = local.data.toJSON ? local.data.toJSON() : local.data;

	const localType = localData.type || ApplicationCommandType.ChatInput;
	const existingDescription = existing.description || "";
	const localDescription = localData.description || "";

	if (existing.type !== localType || existing.name !== localData.name || existingDescription !== localDescription) {
		return true;
	}

	let existingContexts = existing.contexts || [];
	const localContexts = localData.contexts || [];

	if (existingContexts.length === 0 && localContexts.length === 1 && String(localContexts[0]) === "0") {
		existingContexts = ["0"];
	}

	if (arraysChanged(existingContexts, localContexts)) return true;

	let existingIntegrations = existing.integrationTypes || [];
	const localIntegrations = localData.integration_types || [];

	if (existingIntegrations.length === 0 && localIntegrations.length === 1 && String(localIntegrations[0]) === "0") {
		existingIntegrations = ["0"];
	}

	if (arraysChanged(existingIntegrations, localIntegrations)) return true;

	if (!localData.contexts || localData.contexts.length === 0) {
		if (typeof localData.dm_permission !== "undefined" && typeof existing.dmPermission === "boolean" && existing.dmPermission !== localData.dm_permission) {
			return true;
		}
	}

	if ((existing.nsfw ?? false) !== (localData.nsfw ?? false)) return true;

	return optionsChanged(existing.options || [], localData.options || []);
};

function arraysChanged(arr1, arr2) {
	const a1 = arr1 || [];
	const a2 = arr2 || [];

	if (a1.length !== a2.length) return true;

	const sorted1 = [...a1].map(String).sort();
	const sorted2 = [...a2].map(String).sort();

	for (let i = 0; i < sorted1.length; i++) {
		if (sorted1[i] !== sorted2[i]) return true;
	}

	return false;
}

function optionsChanged(existingOpts, localOpts) {
	if (existingOpts.length !== localOpts.length) return true;

	for (let i = 0; i < existingOpts.length; i++) {
		const existing = existingOpts[i];
		const local = localOpts[i];

		const existingOptDesc = existing.description || "";
		const localOptDesc = local.description || "";

		if (existing.name !== local.name || existing.type !== local.type || existingOptDesc !== localOptDesc || (existing.required ?? false) !== (local.required ?? false) || (existing.autocomplete ?? false) !== (local.autocomplete ?? false)) {
			return true;
		}

		const existingChoices = existing.choices || [];
		const localChoices = local.choices || [];
		if (existingChoices.length !== localChoices.length) return true;

		for (let j = 0; j < existingChoices.length; j++) {
			if (existingChoices[j].name !== localChoices[j].name || String(existingChoices[j].value) !== String(localChoices[j].value)) {
				return true;
			}
		}

		const existingChannelTypes = existing.channelTypes || [];
		const localChannelTypes = local.channel_types || [];
		if (arraysChanged(existingChannelTypes, localChannelTypes)) return true;

		if ((existing.minValue ?? undefined) !== (local.min_value ?? undefined) || (existing.maxValue ?? undefined) !== (local.max_value ?? undefined) || (existing.minLength ?? undefined) !== (local.min_length ?? undefined) || (existing.maxLength ?? undefined) !== (local.max_length ?? undefined)) {
			return true;
		}

		if (optionsChanged(existing.options || [], local.options || [])) return true;
	}

	return false;
}
