import React from "react";

import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const RecentGame = ({ game_date, home, home_goals, away, away_goals }) => {
	const teamNameStyle = { 
		display: "flex", 
		justifyContent: "left", 
		padding: 0
	};

	const teamScoreStyle = { 
		display: "flex", 
		justifyContent: "right", 
		padding: 0
	};

	return (
		<Card>
			<Card.Body>
				<Card.Title>{game_date.split("T")[0]}</Card.Title>
				<Container>
					<Row>
						<Col xs="auto" style={teamNameStyle}>
							<p style={{ marginBottom: 0 }}>{home}</p>
						</Col>
						<Col style={teamScoreStyle}>
							<p style={{ marginBottom: 0 }}>{home_goals}</p>
						</Col>
					</Row>
					<Row>
						<Col xs="auto" style={teamNameStyle}>
							<p style={{ marginBottom: 0 }}>{away}</p>
						</Col>
						<Col style={teamScoreStyle}>
							<p style={{ marginBottom: 0 }}>{away_goals}</p>
						</Col>
					</Row>
				</Container>
			</Card.Body>
		</Card>
	); 
};

export default RecentGame;
