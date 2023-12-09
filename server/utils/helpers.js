const queryToJson = (result) => {
	const keys = [];

	result.metaData.forEach((e) => {
		keys.push(e.name.toLowerCase());
	})

	const rows = result.rows;

	const toJson = rows.map(row => {
		const obj = {};
		keys.forEach((key, index) => {
			obj[key] = row[index];
		});
		return obj;
	});

	return toJson;
};

module.exports = queryToJson;