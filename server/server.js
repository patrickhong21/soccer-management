// Server Model (server.js, dbQueries.js, controller.js) inspired by
// https://github.students.cs.ubc.ca/CPSC304/CPSC304_Node_Project

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser')
const controller = require("./controller");

const loadEnvFile = require("./utils/envUtil");
const envVariables = loadEnvFile("../.env");
const PORT = envVariables.PORT || 65534; // Adjust the PORT if needed (e.g., if you encounter a "port already occupied" error)

// Middleware setup
// CORS to allow front end to query backend
app.use(cors());

// parse incoming request bodies
app.use(bodyParser.json());

// mount the router
app.use("/", controller);

// Parse incoming JSON payloads
app.use(express.json());

// Starting the server
app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}/`);
});
