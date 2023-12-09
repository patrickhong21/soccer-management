import React from "react";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import axios from "axios";

const DeleteAthleteModal = ({ person_id, athletes, setAthletes, showDeleteAthlete, setShowDeleteAthlete }) => {
	let athlete;
	for (let a of athletes) {
		if (a.person_id == person_id) {
			athlete = a;
			break;
		}
	}

	const deleteAthlete = () => {
		setShowDeleteAthlete(!showDeleteAthlete);

		axios.delete(`http://localhost:65535/athlete/${person_id}`)
			.then((res) => {
				console.log(res);
			})
			.catch((err) => {
				console.error(err);
			});

		setAthletes(athletes.filter(athlete => athlete.person_id != person_id));
	};

	return (
		<Modal centered show={showDeleteAthlete} onHide={() => setShowDeleteAthlete(false)}>
			<Modal.Header closeButton>
				<Modal.Title>Delete {athlete ? athlete.name : "Athlete"}</Modal.Title>
			</Modal.Header>
			<Modal.Body>Are you sure you want to delete {athlete?.name}?</Modal.Body>
			<Modal.Footer>
				<Button id={person_id} variant="danger" onClick={deleteAthlete}>
					Delete
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default DeleteAthleteModal;
