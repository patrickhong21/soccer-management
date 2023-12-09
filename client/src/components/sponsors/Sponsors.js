import { React, useState } from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";

import axios from "axios";

import { sponsorsFormHasErrors, generateSponsorFormWhereClause } from "../../utils/helpers";

const Sponsors = () => {
	const [formData, setFormData] = useState({
		name: "default",
		nameVal: "",
		andor1: "default",
		email: "default",
		emailVal: "",
		andor2: "default",
		money: "default",
		moneyVal: ""
	});

	const [sponsorTable, setSponsorTable] = useState([]);

	const handleChange = (e) => {
		e.persist();
		setFormData(oldState => {
			return {
				...oldState,
				[e.target.name]: e.target.value
			};
		});
	};

	const handleSubmit = () => {
		const errors = 	sponsorsFormHasErrors(formData);

		if (errors.length !== 0) {
			alert(`${errors.join("\n")}`);
			return;
		}

		let whereClause = generateSponsorFormWhereClause(formData);

		axios.post("http://localhost:65535/filter-sponsor", { whereClause: whereClause })
			.then((res) => {
				setSponsorTable(res.data);
			})
			.catch((err) => {
				console.error(err);
			});

	};

	return (
		<Container style={{ marginTop: "20px" }}>
			<Row>
				<h1>Sponsors</h1>
				<p>
					Find any sponsor by filtering below on the attributes you want. Or just press view with no filters to see all of the sponsors.
				</p>
			</Row>
			<Row >
				<Col>
					<Col style={{ display: "flex", gap: "8px" }}>
						<Button variant="success" onClick={handleSubmit}>View</Button>
					</Col>
				</Col>
			</Row>
			<Form>
				<Row>
					<Col xs={1}></Col>
					<Col xs={2}>
						<Form.Group controlId="name">
							<Form.Label>name filter</Form.Label>
							<Form.Select aria-label="name" name="name" onChange={handleChange}>
								<option value="default">-</option>
								<option value="sponsor_name =">sponsor_name equals</option>
							</Form.Select>
						</Form.Group>
					</Col>
					<Col xs={3}>
						<Form.Group controlId="nameVal">
							<Form.Label>name</Form.Label>
							<Form.Control type="text" name="nameVal" onChange={handleChange} required/>
						</Form.Group>
					</Col>
				</Row>
				<Row>
					<Col xs={1} style={{ marginTop: "auto" }}>
						<Form.Group controlId="andor1">
							<Form.Select aria-label="andor1" name="andor1" onChange={handleChange}>
								<option value="default">-</option>
								<option value="AND">AND</option>
								<option value="OR">OR</option>
							</Form.Select>
						</Form.Group>
					</Col>
					<Col xs={2}>
						<Form.Group controlId="email">
							<Form.Label>email filter</Form.Label>
							<Form.Select aria-label="email" name="email" onChange={handleChange}>
								<option value="default">-</option>
								<option value="sponsor_email =">sponsor_email equals</option>
							</Form.Select>
						</Form.Group>
					</Col>
					<Col xs={3}>
						<Form.Group controlId="emailVal">
							<Form.Label>email</Form.Label>
							<Form.Control type="text" name="emailVal" onChange={handleChange} required/>
						</Form.Group>
					</Col>
				</Row>
				<Row>
					<Col xs={1} style={{ marginTop: "auto" }}>
						<Form.Group controlId="andor2">
							<Form.Select aria-label="andor2" name="andor2" onChange={handleChange}>
								<option value="default">-</option>
								<option value="AND">AND</option>
								<option value="OR">OR</option>
							</Form.Select>
						</Form.Group>
					</Col>
					<Col xs={2}>
						<Form.Group controlId="money">
							<Form.Label>money filter</Form.Label>
							<Form.Select aria-label="money" name="money" onChange={handleChange}>
								<option value="default">-</option>
								<option value="money_granted <">money_granted &lt;</option>
								<option value="money_granted <=">money_granted ≤</option>
								<option value="money_granted =">money_granted =</option>
								<option value="money_granted >=">money_granted ≥</option>
								<option value="money_granted >">money_granted &gt;</option>
							</Form.Select>
						</Form.Group>
					</Col>
					<Col xs={3}>
						<Form.Group controlId="moneyVal">
							<Form.Label>money</Form.Label>
							<Form.Control type="number" min="0" name="moneyVal" onChange={handleChange} required/>
						</Form.Group>
					</Col>
				</Row>
			</Form>
			<Row style={{ marginTop: "20px" }}>
				<Table striped bordered>
					<thead>
						<tr>
							<th>sponsor_name</th>
							<th>sponsor_email</th>
							<th>money_granted</th>
						</tr>
					</thead>
					<tbody>
						{sponsorTable.length !== 0  && sponsorTable.map((d, i) => {
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
	);
};

export default Sponsors;
