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
