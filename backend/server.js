const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const incidentRoutes = require("./routes/incidentRoutes");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/incidents", incidentRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "SHAHAY backend is running"
    });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`SHAHAY server running on port ${PORT}`);
});