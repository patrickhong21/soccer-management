import { useEffect, useState } from "react";

import axios from "axios";

import Modal from "react-bootstrap/Modal";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/esm/Container";

const ViewAthleteModal = ({ person_id, athletes, setAthletes, showViewAthlete, setShowViewAthlete }) => {
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
	}, [person_id, showViewAthlete]);

	const [awards, setAwards] = useState("");

	useEffect(() => {
		axios.get(`http://localhost:65535/awards/athlete/${person_id}`)
			.then((res) => {
				const arrAwards = res.data.map((d) => {
					return `${d.year} ${d.award_name}`
				});
				const strAwards = arrAwards.join(", ");
				setAwards(strAwards);
			})
			.catch((err) => {
				console.error(err);
			})
	}, [person_id, showViewAthlete]);


	return (
		<Modal centered size="lg" show={showViewAthlete} onHide={() => setShowViewAthlete(false)}>
			<Modal.Header closeButton>
				<Modal.Title>View {athlete ? athlete.name : "Athlete"}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Container>
					<Row>
						<Col style={{ paddingLeft: "12%" }}>
							<p style={{ marginBottom: 0 }}>Height: {athlete?.height} cm</p>
							<p style={{ marginBottom: 0 }}>Weight: {athlete?.weight} kg</p>
							<p style={{ marginBottom: 0 }}>Date Started: {athlete?.date_started?.split("T")[0]}</p>
							<p style={{ marginBottom: 0 }}>Years of Experience: {(athlete && athlete.date_started) ? new Date(new Date() - new Date(athlete.date_started.split("T")[0])).getFullYear() - 1970 : 0}</p>
							<p style={{ marginBottom: 0 }}>Jersey/Position: {athlete?.jersey_num} ({positions[athlete?.jersey_num]})</p>
							<p style={{ marginBottom: 0 }}>Team: {athlete?.current_team}</p>
							<p style={{ marginBottom: 0 }}>Awards: {awards === "" ? "N/A" : awards}</p>
						</Col>
						<Col>
							<p style={{ marginBottom: 0 }}>Birthdate: {athlete?.birthdate?.split("T")[0]}</p>
							<p style={{ marginBottom: 0 }}>Age: {(athlete && athlete.birthdate) ? new Date(new Date() - new Date(athlete.birthdate.split("T")[0])).getFullYear() - 1970 : 0}</p>
							<p style={{ marginBottom: 0 }}>Phone Number: {athlete?.phone_number}</p>
							<p style={{ marginBottom: 0 }}>Email: {athlete?.email}</p>
							<p style={{ marginBottom: 0 }}>Address: {athlete?.address}</p>
							<p style={{ marginBottom: 0 }}>Salary: ${athlete?.salary}</p>
						</Col>
					</Row>
				</Container>
			</Modal.Body>
		</Modal>
	);
}

export default ViewAthleteModal;
