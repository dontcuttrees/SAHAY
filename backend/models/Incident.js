const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
    {
        incidentId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Medical",
                "Water",
                "Food",
                "Shelter",
                "Missing Persons"
            ]
        },

        severity: {
            type: String,
            required: true,
            enum: [
                "Critical",
                "High",
                "Medium",
                "Low"
            ]
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        peopleAffected: {
            type: Number,
            required: true,
            min: 1
        },

        lat: {
            type: Number,
            required: true
        },

        lng: {
            type: Number,
            required: true
        },

        timestamp: {
            type: Date,
            default: Date.now
        },

        status: {
            type: String,
            enum: [
                "Pending Sync",
                "Synced",
                "Acknowledged",
                "Assigned",
                "In Progress",
                "Resolved"
            ],
            default: "Pending Sync"
        },

        originNode: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Incident", incidentSchema);