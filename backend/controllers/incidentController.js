const Incident = require("../models/Incident");

const createIncident = async (req, res) => {
    try {
        const {
            category,
            severity,
            description,
            peopleAffected,
            lat,
            lng,
            originNode
        } = req.body;

        const incidentId = `INC-${Date.now()}`;

        const incident = await Incident.create({
            incidentId,
            category,
            severity,
            description,
            peopleAffected,
            lat,
            lng,
            originNode,
            status: "Pending Sync"
        });

        res.status(201).json({
            success: true,
            message: "Incident created successfully",
            incident
        });

    } catch (error) {
        console.error("Create incident error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create incident",
            error: error.message
        });
    }
};


// GET all incidents
const getIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: incidents.length,
            incidents
        });

    } catch (error) {
        console.error("Get incidents error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch incidents",
            error: error.message
        });
    }
};

const updateIncidentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "Pending Sync",
            "Synced",
            "Acknowledged",
            "Assigned",
            "In Progress",
            "Resolved"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid incident status"
            });
        }

        const incident = await Incident.findOneAndUpdate(
            { incidentId: req.params.incidentId },
            { status },
            { new: true, runValidators: true }
        );

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: "Incident not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Incident status updated",
            incident
        });

    } catch (error) {
        console.error("Update status error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update incident status",
            error: error.message
        });
    }
};


module.exports = {
    createIncident,
    getIncidents,
    updateIncidentStatus
};