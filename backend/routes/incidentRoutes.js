const express = require("express");

const {
    createIncident,
    getIncidents,
    updateIncidentStatus
} = require("../controllers/incidentController");

const router = express.Router();

router.post("/", createIncident);

router.get("/", getIncidents);

router.patch("/:incidentId/status", updateIncidentStatus);

module.exports = router;