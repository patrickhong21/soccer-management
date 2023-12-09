// From https://github.students.cs.ubc.ca/CPSC304/CPSC304_Node_Project

const fs = require("fs");

function loadEnvFile(filePath) {
	if (fs.existsSync(filePath)) {
		const envFile = fs.readFileSync(filePath, "utf8");

		const envVars = envFile.split("\n").reduce((acc, line) => {
			const [key, value] = line.split("=");
			acc[key] = value;
			if (typeof acc[key] !== "undefined") {
				acc[key] = acc[key].replace("\r", "");
			}
			return acc;
		}, {});

		return envVars;
	} else {
		console.error(`.env file not found at ${filePath}`);
		return {};
	}
}

module.exports = loadEnvFile;
