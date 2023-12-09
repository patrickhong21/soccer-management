import { React, useState, useEffect } from "react";

import RecentGame from "./RecentGame";

import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";

import axios from "axios";

const RecentGames = () => {
	
	const [games, setGames] = useState([]);

	useEffect(() => {
		axios.get("http://localhost:65535/recent-games", { params: { limit: 4 } })
			.then((res) => {
				setGames(res.data);
			})
			.catch((err) => {
				console.error(err);
			});

	});

	return (
		<Card>
			<Card.Header as="h5">Recent Games</Card.Header>
			<Card.Body style={{ paddingTop: 0 }}>
				<Container>
					{games.length !== 0 ? 
						games.map((obj, i) => {
							if (i >= games.length / 2) return null;
							return (
								<Row key={`games-${i}`}style={{ marginTop: "20px" }}>
									<Col>
										{2 * i < games.length ? <RecentGame {...games[2 * i]}/> : null}
									</Col>
									<Col>
										{2 * i + 1 < games.length ? <RecentGame {...games[2 * i + 1]}/> : null}
									</Col>
								</Row>
							);
						}) : 
						<div style={{ padding: "50px" }}>
							<Spinner animation="border"/>
						</div>}
				</Container>
			</Card.Body>
		</Card>
	);
};

export default RecentGames;
