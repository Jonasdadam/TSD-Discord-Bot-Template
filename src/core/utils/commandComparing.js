const { ApplicationCommandType } = require("discord.js");

module.exports = (existing, local) => {
  // 1. Normalize local data (handle Builder instances vs JSON objects)
  const localData = local.data.toJSON ? local.data.toJSON() : local.data;

  // 2. Check top-level fields
  const localType = localData.type || ApplicationCommandType.ChatInput;

  if (existing.type !== localType) return true;

  // Normaliseer beschrijvingen: Discord API geeft "" terug als het leeg is, Builder geeft undefined.
  const existingDescription = existing.description || "";
  const localDescription = localData.description || "";

  if (existing.name !== localData.name || existingDescription !== localDescription) {
    return true;
  }

  // 3. Check permissions (DMPermission / nsfw)
  // DMPermission logic:
  // API kan null geven (vooral bij Guild Commands of deprecated v14 logic).
  // We vergelijken ALLEEN als de API expliciet true/false teruggeeft.
  // Als API null/undefined is, negeren we de check om loops te voorkomen.
  if (
    typeof localData.dm_permission !== "undefined" && 
    typeof existing.dmPermission === "boolean"
  ) {
    if (existing.dmPermission !== localData.dm_permission) return true;
  }
  
  // NSFW check (behandel null/undefined als false)
  const existingNSFW = existing.nsfw ?? false;
  const localNSFW = localData.nsfw ?? false;
  
  if (existingNSFW !== localNSFW) return true;

  // 4. Check Options (Recursive)
  const existingOptions = existing.options || [];
  const localOptions = localData.options || [];

  return optionsChanged(existingOptions, localOptions);
};

function optionsChanged(existingOpts, localOpts) {
  if (existingOpts.length !== localOpts.length) return true;

  for (let i = 0; i < existingOpts.length; i++) {
    const existing = existingOpts[i];
    const local = localOpts[i];

    // Normaliseer beschrijving voor opties
    const existingOptDesc = existing.description || "";
    const localOptDesc = local.description || "";

    // Basic fields
    if (
      existing.name !== local.name ||
      existing.type !== local.type ||
      existingOptDesc !== localOptDesc ||
      (existing.required ?? false) !== (local.required ?? false) ||
      (existing.autocomplete ?? false) !== (local.autocomplete ?? false)
    ) {
      return true;
    }

    // Choices Comparison
    const existingChoices = existing.choices || [];
    const localChoices = local.choices || [];

    if (existingChoices.length !== localChoices.length) return true;

    for (let j = 0; j < existingChoices.length; j++) {
      if (
        existingChoices[j].name !== localChoices[j].name ||
        existingChoices[j].value !== localChoices[j].value
      ) {
        return true;
      }
    }

    // Channel Types
    const existingChannelTypes = existing.channelTypes || [];
    const localChannelTypes = local.channel_types || [];

    if (existingChannelTypes.length !== localChannelTypes.length) return true;
    
    const existingTypesSorted = [...existingChannelTypes].sort().join(",");
    const localTypesSorted = [...localChannelTypes].sort().join(",");
    if (existingTypesSorted !== localTypesSorted) return true;

    // Number Constraints
    if (
      (existing.minValue ?? undefined) !== (local.min_value ?? undefined) ||
      (existing.maxValue ?? undefined) !== (local.max_value ?? undefined)
    ) {
      return true;
    }

    // String Constraints
    if (
      (existing.minLength ?? undefined) !== (local.min_length ?? undefined) ||
      (existing.maxLength ?? undefined) !== (local.max_length ?? undefined)
    ) {
      return true;
    }

    // Recursive Sub-options
    const existingSubOptions = existing.options || [];
    const localSubOptions = local.options || [];

    if (existingSubOptions.length > 0 || localSubOptions.length > 0) {
      if (optionsChanged(existingSubOptions, localSubOptions)) {
        return true;
      }
    }
  }

  return false;
}