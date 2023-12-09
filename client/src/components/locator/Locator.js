import { React, useState, useEffect } from "react";

import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";

import axios from "axios";

const Locator = () => {
	const [venueNames, setVenueNames] = useState([]);

	useEffect(() => {
		axios.get("http://localhost:65535/venues")
		.then((res) => {
			setVenueNames(res.data.map((venue) => venue.venue_name));
		})
		.catch((err) => {
			console.error(err);
		});
	});

	const [currVenueName, setCurrVenueName] = useState("default");

	const handleTableChange = (e) => {
		e.persist();
		setCurrVenueName(e.target.value);
	}

	const [data, setData] = useState([]);

	const handleClick = () => {
		axios.post("http://localhost:65535/find-games/", { venueName: currVenueName })
			.then((res) => {
				setData(res.data);
			})
			.catch((err) => {
				console.error(err);
			});
	}

	return (
		<Container style={{ marginTop: "20px" }}>
			<Row>
				<Col>
					<h1>Game Locator</h1>
					<p>Find all games that have been played in any stadium using the dropdown below!</p>
				</Col>
			</Row>
			<Container>
				<Row>
					<Form>
						<Row>
							<Col xs={2}>
								<Form.Group controlId="tables">
									<Form.Label>Venue:</Form.Label>
									<Form.Select aria-label="tables" name="tables" onChange={handleTableChange}>
										<option value="default">-</option>
										{venueNames.map((venueName, i) => {
											return (
												<option key={`table-${i}`} value={venueName}>{venueName}</option>
											);
										})}
									</Form.Select>
								</Form.Group>
							</Col>
							<Col style={{ display: "flex", alignItems: "center", marginTop: "auto" }}>
								{currVenueName === "default" ?
									<Button variant="secondary" disabled>View</Button> :
									<Button variant="success" onClick={handleClick}>View</Button>
								}
							</Col>
						</Row>
					</Form>
				</Row>
				<Row style={{ marginTop: "20px" }}>
					<Table striped bordered>
					<thead>
						<tr>
							<th>Date</th>
							<th>Home</th>
							<th>Away</th>
							<th>Address</th>
						</tr>
					</thead>
					<tbody>
						{data.length !== 0  && data.map((d, i) => {
							return (
								<tr key={`body-${i}`}>
									{Object.keys(d).map((k, j) => {
										return (
											<td key={`cell-${j}`}>{d[k]}</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</Table>
				</Row>
			</Container>
			
		</Container>
	);
};

export default Locator;
