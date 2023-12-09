import { useEffect, useState } from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";

import axios from "axios";

const Advanced = () => {
	const [tables, setTables] = useState([]);

	useEffect(() => {
		axios.get("http://localhost:65535/tables")
			.then((res) => {
				setTables(res.data.map((d) => d.table_name));
			})
			.catch((err) => {
				console.error(err);
			})
	}, []);

	const [currTable, setCurrTable] = useState("");

	const [attributes, setAttributes] = useState([]);

	useEffect(() => {
		if (currTable !== "") {
			axios.get(`http://localhost:65535/table/${currTable}/attributes`)
				.then((res) => {
					setAttributes(res.data.map((d) => d.column_name.toLowerCase()));
				})
				.catch((err) => {
					console.error(err);
				})
		}
	}, [currTable]);

	const [selectedAttributes, setSelectedAttributes] = useState([]);

	const handleTableChange = (e) => {
		e.persist();
		setSelectedAttributes([]);
		setCurrTable(e.target.value);
	};

	const handleAttributeChange = (e) => {
		e.persist();		
		if (selectedAttributes.includes(e.target.name)) {
			setSelectedAttributes(selectedAttributes.filter((s) => s !== e.target.name));
		} else {
			setSelectedAttributes([...selectedAttributes, e.target.name]);
		}
	};

	const [data, setData] = useState([]);

	const handleClick = (e) => {
		axios.post("http://localhost:65535/table", {
			table: currTable,
			attributes: selectedAttributes
		})
		.then((res) => {
			setData(res.data);
		})
		.catch((err) => {
			console.error(err);
		});
	};

	return (
		<Container style={{ marginTop: "20px" }}>
			<Row>
			<Col>
				<h1>Advanced Data Viewer</h1>
			</Col>
			</Row>
			{tables.length !== 0 ? 
			<Container>
				<Row>
					<Form>
						<Row>
							<Col xs={2}>
								<Form.Group controlId="tables">
									<Form.Label>Table:</Form.Label>
									<Form.Select aria-label="tables" name="tables" onChange={handleTableChange}>
										<option value="default">-</option>
										{tables.map((table_name, i) => {
											return (
												<option key={`table-${i}`} value={table_name}>{table_name}</option>
											);
										})}
									</Form.Select>
								</Form.Group>
							</Col>
							<Col>
								<Form.Group controlId="attributes">
									<Form.Label>Select Attributes:</Form.Label>
									<Col>
									{attributes.map((a, i) => {
										return (
											<Form.Check
												inline
												label={a}
												name={a}
												type="checkbox"
												key={`attr-${i}`}
												checked={selectedAttributes.includes(a)}
												onChange={handleAttributeChange}
											/>
										);
									})}
									</Col>
								</Form.Group>
							</Col>
							<Col xs={1} style={{ display: "flex", alignItems: "center" }}>
								{selectedAttributes.length === 0 ?
									<Button variant="secondary" disabled>View</Button> :
									<Button variant="success" onClick={handleClick}>View</Button>
								}
							</Col>
						</Row>
					</Form>
				</Row>
				<Row style={{ marginTop: "20px" }}>
				<Table striped bordered responsive>
					<thead>
						<tr>
							{data.length !== 0 && Object.keys(data[0]).map((k, i) => {
								return (
									<th key={`header-${i}`}>{k}</th>
								);
							})}
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
			</Container> :
			<div style={{ padding: "50px" }}>
				<Spinner animation="border"/>
			</div>}
		</Container>
	);
};

export default Advanced;
