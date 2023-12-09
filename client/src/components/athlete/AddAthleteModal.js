import { useEffect, useState } from "react";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import axios from "axios";

import { athleteFormHasErrors } from "../../utils/helpers";

const AddAthleteModal = ({ athletes, setAthletes, showAddAthlete, setShowAddAthlete }) => {
	const [positions, setPositions] = useState({});

	useEffect(() => {
		axios.get("http://localhost:65535/positions")
			.then((res) => {
				let ret = {};
				for (let d of res.data) {
					ret[d.jersey_num] = d.position
				}
				setPositions(ret);
			})
			.catch((err) => {
				console.error(err);
			});
	}, []);

	const [teams, setTeams] = useState([]);

	useEffect(() => {
		axios.get("http://localhost:65535/teams")
			.then((res) => {
				setTeams(res.data.map((obj) => obj.team_name));
			})
			.catch((err) => {
				console.error(err);
			});
	}, []);

	const [athlete, setAthlete] = useState({
		person_id: null,
		name: null,
		birthdate: null,
		height: null,
		weight: null,
		phone_number: null,
		email: null,
		address: null,
		date_started: null,
		jersey_num: null,
		current_team: null,
		salary: null
	});

	const handleFormChange = (e) => {
		e.persist();
		setAthlete(oldState => {
			return {
				...oldState,
				[e.target.name]: (["height", "weight", "salary", "phone_number"].includes(e.target.name)) ? Number(e.target.value) : e.target.value
			};
		});
	};

	const addAthlete = async () => {
		const nextID = Math.max(...athletes.map((a) => a.person_id)) + 1;

		// make sure post request gets nextid
		const newAthlete = {...athlete, person_id: nextID};
		setAthlete(newAthlete);

		// data validation
		const errors = await athleteFormHasErrors(newAthlete);

		if (errors.length === 0 
			&& (athlete.jersey_num !== null && athlete.jersey_num !== "default") 
			&& (athlete.current_team !== null && athlete.current_team !== "default")) {
			axios.post("http://localhost:65535/athlete", newAthlete)
				.then((res) => {
					console.log(res);
				})
				.catch((err) => {
					// TODO if input invalid notify user
					console.error(err);
				});
	
			setAthletes([{ 
				"person_id": athlete.person_id,
				"name": athlete.name, 
				"position": positions[athlete.jersey_num], 
				"team": athlete.current_team 
			}, ...athletes]);
			setShowAddAthlete(false);
		} else {
			console.log(athlete);
			if (athlete.jersey_num === null || athlete.jersey_num === "default") {
				errors.push("Select a Number/Position");
			}
			console.log(athlete);
			if (athlete.current_team === null || athlete.current_team === "default") {
				errors.push("Select a Team");
			}
			alert(`${errors.join("\n")}`);
		}
	};

	return (
		<Modal centered size="lg" show={showAddAthlete} onHide={() => {
			setShowAddAthlete(false);
			setAthlete({...athlete, current_team: null, jersey_num: null}); // to reset after user closes modal
		}}>
			<Modal.Header closeButton>
				<Modal.Title>Add Athlete</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Row>
						<Col>
							<Form.Group controlId="name">
								<Form.Label>Full Name</Form.Label>
								<Form.Control type="text" name="name" onChange={handleFormChange} required/>
							</Form.Group>
						</Col>
						<Col>
							<Form.Group controlId="height">
								<Form.Label>Height</Form.Label>
								<Form.Control type="number" min="0" name="height" onChange={handleFormChange} placeholder="Enter height (cm)" required/>
							</Form.Group>
						</Col>
						<Col>
							<Form.Group controlId="weight">
								<Form.Label>Weight</Form.Label>
								<Form.Control type="number" min="0" name="weight" onChange={handleFormChange} placeholder="Enter weight (kg)" required/>
							</Form.Group>
						</Col>
						<Col>
							<Form.Group controlId="birthdate">
								<Form.Label>Birth Date</Form.Label>
								<Form.Control type="date" name="birthdate" onChange={handleFormChange} required/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col>
							<Form.Group controlId="jersey">
								<Form.Label>Number/Position</Form.Label>
								<Form.Select aria-label="jersey" name="jersey_num" onChange={handleFormChange}>
									<option value="default">-</option>
									{Object.keys(positions).map((p, i) => {
										return (
											<option value={i+1} key={`jersey-${i+1}`}>{i+1} ({positions[i+1]})</option>
										);
									})}
								</Form.Select>
							</Form.Group>
						</Col>
						<Col>
							<Form.Group controlId="team">
								<Form.Label>Team</Form.Label>
								<Form.Select aria-label="team" name="current_team" onChange={handleFormChange}>
									<option value="default">-</option>
									{teams.map((t, i) => {
										return (
											<option key={i} value={t}>{t}</option>
										);
									})}
								</Form.Select>
							</Form.Group>
						</Col>
						<Col>
							<Form.Group controlId="start-date">
								<Form.Label>Start Date</Form.Label>
								<Form.Control type="date" name="date_started" onChange={handleFormChange} required/>
							</Form.Group>
						</Col>
						<Col>
							<Form.Group controlId="salary">
								<Form.Label>Salary</Form.Label>
								<Form.Control type="number" name="salary" onChange={handleFormChange} min="0" placeholder="" required/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col>
							<Form.Group controlId="address">
								<Form.Label>Address</Form.Label>
								<Form.Control type="text" name="address" onChange={handleFormChange} placeholder="1234 Main St, Vancouver" required/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col>
							<Form.Group controlId="email">
								<Form.Label>Email address</Form.Label>
								<Form.Control type="email" name="email" onChange={handleFormChange} placeholder="name@example.com" required/>
							</Form.Group>
						</Col>
						<Col>
							<Form.Group controlId="phone">
								<Form.Label>Phone #</Form.Label>
								<Form.Control type="text" name="phone_number" onChange={handleFormChange} required/>
							</Form.Group>
						</Col>
					</Row>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="primary" onClick={addAthlete}>
					Add
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default AddAthleteModal;
