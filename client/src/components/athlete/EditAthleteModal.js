import { useEffect, useState } from "react";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import axios from "axios";

import { athleteFormHasErrors } from "../../utils/helpers";

const EditAthleteModal = ({ person_id, athletes, setAthletes, showEditAthlete, setShowEditAthlete }) => {
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

	const [athlete, setAthlete] = useState({});

	useEffect(() => {
		axios.get(`http://localhost:65535/athlete/${person_id}`)
			.then((res) => {
				setAthlete(res.data[0]);
			})
			.catch((err) => {
				console.error(err);
			})
	}, [person_id, showEditAthlete]);

	const handleFormChange = (e) => {
		e.persist();
		setAthlete(oldState => {
			return {
				...oldState,
				[e.target.name]: (["height", "weight", "salary", "phone_number"].includes(e.target.name)) ? Number(e.target.value) : e.target.value
			};
		});
	};

	const editAthlete = async () => {
		const editedAthlete = {
			...athlete, 
			birthdate: athlete.birthdate.split("T")[0], 
			date_started: athlete.date_started.split("T")[0]
		};

		const errors = await athleteFormHasErrors(editedAthlete);

		if (errors.length === 0) {
			axios.put("http://localhost:65535/athlete", editedAthlete)
				.then((res) => {
					console.log(res);
				})
				.catch((err) => {
					console.error(err);
				});
	
			const updatedAthletes = athletes.map((obj) => {
				if (obj.person_id == person_id) {
					return {
						"person_id": athlete.person_id,
						"name": athlete.name, 
						"position": positions[athlete.jersey_num], 
						"team": athlete.current_team 
					};
				}
				return obj;
			});
	
			setAthletes(updatedAthletes);
			setShowEditAthlete(false);
		} else {
			alert(`${errors.join("\n")}`);
		}
	} 

	return (
		<Modal centered size="lg" show={showEditAthlete} onHide={() => setShowEditAthlete(false)}>
			<Modal.Header closeButton>
				<Modal.Title>Edit {athlete ? athlete.name : "Athlete"}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Row>
						<Col>
							<Form.Group controlId="name">
								<Form.Label>Full Name</Form.Label>
								<Form.Control type="text" name="name" onChange={handleFormChange} value={athlete ? athlete.name : ""} required/>
							</Form.Group>
						</Col>
						<Col>
							<Form.Group controlId="height">
								<Form.Label>Height</Form.Label>
								<Form.Control type="number" min="0" name="height" onChange={handleFormChange} value={athlete ? athlete.height : ""} placeholder="Enter height (cm)" required/>
							</Form.Group>
						</Col>
						<Col>
							<Form.Group controlId="weight">
								<Form.Label>Weight</Form.Label>
								<Form.Control type="number" min="0" name="weight" onChange={handleFormChange} value={athlete ? athlete.weight : ""} placeholder="Enter weight (kg)" required/>
							</Form.Group>
						</Col>
						<Col>
							<Form.Group controlId="birthdate">
								<Form.Label>Birth Date</Form.Label>
								<Form.Control type="date" name="birthdate" value={(athlete && athlete.birthdate) ? athlete.birthdate.split("T")[0] : ""} onChange={handleFormChange} required/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col>
							<Form.Group controlId="jersey">
								<Form.Label>Number/Position</Form.Label>
								<Form.Select aria-label="jersey" name="jersey_num" value={athlete ? athlete.jersey_num : ""} onChange={handleFormChange}>
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
								<Form.Select aria-label="team" name="current_team" value={athlete ? athlete.current_team : ""} onChange={handleFormChange}>
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
								<Form.Control type="date" name="date_started" value={(athlete && athlete.date_started) ? athlete.date_started.split("T")[0] : ""} onChange={handleFormChange} required/>
							</Form.Group>
						</Col>
						<Col>
							<Form.Group controlId="salary">
								<Form.Label>Salary</Form.Label>
								<Form.Control type="number" name="salary" min="0" value={athlete ? athlete.salary : ""} onChange={handleFormChange} required/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col>
							<Form.Group controlId="address">
								<Form.Label>Address</Form.Label>
								<Form.Control type="text" name="address" value={athlete ? athlete.address : ""} onChange={handleFormChange} placeholder="1234 Main St, Vancouver" required/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col>
							<Form.Group controlId="email">
								<Form.Label>Email address</Form.Label>
								<Form.Control type="email" name="email" value={athlete ? athlete.email : ""} onChange={handleFormChange} placeholder="name@example.com" required/>
							</Form.Group>
						</Col>
						<Col>
							<Form.Group controlId="phone">
								<Form.Label>Phone #</Form.Label>
								<Form.Control type="text" name="phone_number" value={athlete ? athlete.phone_number : ""} onChange={handleFormChange} required/>
							</Form.Group>
						</Col>
					</Row>

				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="warning" onClick={editAthlete}>
					Edit
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default EditAthleteModal;
