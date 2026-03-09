# TSD-Discord-Bot-Template 🤖

Welcome to **The SynxDev - Discord Bot Template**! This is a robust, feature-rich, and highly customizable Discord.js v14 bot template. It includes a built-in command handler, event handler, plugin CLI, and advanced error logging.

## ✨ Features
- **Advanced Handlers**: Seamlessly handles Slash Commands, Prefix Commands, Context Menus, Buttons, Select Menus, and Modals.
- **MongoDB Integration**: Built-in Mongoose database connection and profile schema examples.
- **Plugin System**: Built-in `TSD-CLI` to easily install and update official TSD plugins.
- **Developer Protections**: `ownerOnly`, `devOnly`, and `testMode` flags to restrict commands.
- **Advanced Logging**: Built-in error logging, command logging, and crash handling directly to a Discord channel or Webhooks.
- **Cooldown Manager**: Prevent spam with built-in command cooldowns.

---

## 🛠️ Prerequisites
Before starting, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16.11.0 or newer)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas Cluster)
- A Discord Bot Token from the [Discord Developer Portal](https://discord.com/developers/applications)

---

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/TSD-Discord-Bot-Template.git
   
   cd TSD-Discord-Bot-Template

2. **Install dependencies:**
   ```bash
   npm install

3. **Configure the Environment:**
   
   Rename `.env.example` to `.env` and fill in your credentials:
   ```bash
   TOKEN=YOUR_DISCORD_BOT_TOKEN
   MONGODB_TOKEN=YOUR_MONGODB_URI

   # Optional Logging Webhooks
   commandLogWebhookURL=
   buttonLogWebhookURL=
   contextLogWebhookURL=

4. **Configure the Bot:**

   Navigate to `src/configs/botConfig.json` and configure your bot.
   
   **You MUST fill in the development section** or the bot will refuse to start:
   ```bash
   {
       "prefix": "!",
       "development": {
           "ownerID": "YOUR_USER_ID",
           "devIDs": ["YOUR_USER_ID"],
           "devServerID": "YOUR_TEST_SERVER_ID",
           "errorChannelID": "CHANNEL_ID_FOR_CRASH_LOGS"
       },
       "logs": {
           "commands": true,
           "buttons": true,
           "contextMenus": true
       }
   }

5. **Start the Bot:**

   **Production mode**
   ```bash
   npm start
   ```
   **Development mode (auto-restarts on changes)**
   ```bash
   npm run dev
   ```
---

## 🧩 TSD CLI (Plugin System)

This template includes a custom CLI to easily inject plugins directly from TheSynxDev Plugin repository. 

### Enabling the CLI
Before you can use the `tsd` command in your terminal, you need to register it globally using npm. Run the following command in the root folder of your project:

    npm link


### Using the CLI
Once linked, you can use the `tsd` command anywhere within the project folder.

**Commands:**
- Install a plugin: `tsd install <plugin-name>` or `tsd i <plugin-name>`
- Update a plugin: `tsd update <plugin-name>` or `tsd u <plugin-name>`

This will automatically download the required files, place them in the correct `src/` folders, and install any missing npm dependencies!

All available plugins can be found here: [TheSynxDev Plugins](https://jonasdadam.github.io/doc/plugins.html)

---

## 🏗️ Creating Components

This template dynamically loads your commands, buttons, menus, and modals based on the file structure inside the `src/` directory.

### 1. Slash Commands (`src/commands/`)
Create a `.js` file in any subfolder within `src/commands/`.
```js
const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check the bot's latency")
        .setContexts(InteractionContextType.Guild)
	    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
	    .setNSFW(false)
        .toJSON(),

    disabled: false,      // Set to true to disable the command
    ownerOnly: false,     // Only the bot owner can use this
    devOnly: false,       // Only developers listed in config can use this
    testMode: false,      // Only loads in the development server
    cooldown: 5,          // Cooldown in seconds
    userPermissions: [],  // E.g. [PermissionFlagsBits.ManageMessages]
    botPermissions: [],   // Permissions the bot needs to execute this

    run: async (client, interaction) => {
        await interaction.reply({ content: `🏓 Pong! Latency: ${client.ws.ping}ms`, flags: MessageFlags.Ephemeral });
    },
};
```

### 2. Prefix Commands (`src/prefixCommands/`)
Create a `.js` file in any subfolder within `src/prefixCommands/`.
```js
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "ping",
    description: "Check the bot's latency",
    aliases: ["p", "latency"],

    disabled: false,
    ownerOnly: false,
    devOnly: false,
    testMode: false,
    guildOnly: true,
    cooldown: 5,
    userPermissions: [],
    botPermissions: [PermissionFlagsBits.SendMessages],

    run: async (client, message, args) => {
        const embed = new EmbedBuilder().setColor("Blue").setDescription(`🏓 Pong! Latency: ${client.ws.ping}ms`);
        await message.reply({ embeds: [embed] });
    },
};
```
### 3. Buttons (`src/buttons/`)
To handle a button with the custom ID `verify_user`, create a file in `src/buttons/`. Note: The handler matches IDs using `.startsWith()`, allowing you to pass dynamic data like `verify_user_12345`.
```js
module.exports = {
    customId: "example_btn", // Matches interaction.customId
    userPermissions: [],
    botPermissions: [],

    run: async (client, interaction) => {
        await interaction.reply({ content: "Button clicked!", ephemeral: true });
    },
};
```
### 4. Select Menus (`src/selects/`)
Handles String, User, Role, Mentionable, and Channel select menus.
```js
module.exports = {
    customId: "example_select",
    userPermissions: [],
    botPermissions: [],

    run: async (client, interaction) => {
        const selectedValue = interaction.values[0];
        await interaction.reply({ content: `You selected: ${selectedValue}`, ephemeral: true });
    },
};
```
### 5. Modals (`src/modals/`)
Handles modal submissions.
```js
module.exports = {
    customId: "example_MDL",
    userPermissions: [],
    botPermissions: [],

    run: async (client, interaction) => {
        const input = interaction.fields.getTextInputValue("my_text_input");
        await interaction.reply({ content: `You submitted: ${input}`, ephemeral: true });
    },
};
```
### 6. Context Menus (`src/contextmenus/`)
Handles User or Message Context menus.
```js
const { ContextMenuCommandBuilder, ApplicationCommandType, MessageFlags } = require("discord.js");

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("Get Avatar")
        .setType(ApplicationCommandType.User),

    disabled: false,
    ownerOnly: false,
    devOnly: false,
    testMode: false,
    cooldown: 5,
    userPermissions: [],
    botPermissions: [],	

    run: async (client, interaction) => {
        const targetUser = interaction.targetUser;
        await interaction.reply({ content: `Avatar URL: ${targetUser.displayAvatarURL()}`, flags: MessageFlags.Ephemeral });
    },
};
```
---

## 🗄️ Database
This template uses `mongoose`. You can define your schemas in `src/schemas/`.

Example Schema:
```js
const { Schema, model, Types } = require("mongoose");

const profileSchema = new Schema(
	{
		userId: {
			type: String,
			required: true,
			unique: true,
		},

		username: {
			type: String,
			required: true,
			default: "UnknownUser",
			trim: true,
		},

		isBot: {
			type: Boolean,
			default: false,
		},

		guildId: {
			type: String,
			required: true,
			index: true,
		},

		roles: {
			type: [String], // Array
			default: [],
		},

		permissionLevel: {
			type: Number,
			default: 0,
			min: 0,
			max: 10,
		},

		status: {
			type: String,
			enum: ["active", "inactive", "banned"], // Enum
			default: "active",
		},

		xp: {
			type: Number,
			default: 0,
		},

		level: {
			type: Number,
			default: 1,
		},

		balance: {
			type: Schema.Types.Decimal128, // Decimal
			default: 0.0,
		},

		messagesSent: {
			type: Number,
			default: 0,
		},

		lastMessageAt: {
			type: Date,
			default: null,
		},

		warnings: {
			type: Number,
			default: 0,
		},

		notes: {
			type: [String],
			default: [],
		},

		isMuted: {
			type: Boolean,
			default: false,
		},

		muteExpiresAt: {
			type: Date,
			default: null,
		},

		// ===== subdocument =====
		settings: {
			notifications: {
				type: Boolean,
				default: true,
			},
			language: {
				type: String,
				default: "nl",
			},
			theme: {
				type: String,
				enum: ["light", "dark"],
				default: "dark",
			},
		},
	},
	{
		collection: "profiles",
		timestamps: true,
	}
);

module.exports = model("Profile", profileSchema);

```

## ⚠️ Error Logging
When a command or event throws an error, the bot will automatically log it to the channel specified in `botConfig.development.errorChannelID`. Developers can directly interact with the error log via built-in buttons to mark the issue as investigated, fixed, or unknown.

[![errorexample.png](https://i.postimg.cc/Df1b02ch/errorexample.png)](https://postimg.cc/yWYNrC5p)

[![error-Example1.png](https://i.postimg.cc/dVsWnN0Y/error-Example1.png)](https://postimg.cc/8jYBzHWK)

---

### License
This project is licensed under the ISC License.
Created with ❤️ by **TheSynxDev**.