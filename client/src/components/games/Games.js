import { React, useState, useEffect } from "react";

import Game from "./Game";

import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";

import axios from "axios";

const Games = () => {
	
	const [games, setGames] = useState([]);

	useEffect(() => {
		axios.get("http://localhost:65535/recent-games")
			.then((res) => {
				setGames(res.data);
			})
			.catch((err) => {
				console.error(err);
			});

	});

	return (
		<Container style={{ marginTop: "20px" }}>
			<h1>Games</h1>
			{games.length !== 0 ? 
				games.map((obj, i) => {
					if (i >= games.length / 2) return null;
					return (
						<Row key={`games-${i}`}style={{ marginTop: "20px" }}>
							<Col>
								{2 * i < games.length ? <Game {...games[2 * i]}/> : null}
							</Col>
							<Col>
								{2 * i + 1 < games.length ? <Game {...games[2 * i + 1]}/> : null}
							</Col>
						</Row>
					);
				}) : 
				<div style={{ padding: "50px" }}>
					<Spinner animation="border"/>
				</div>}
		</Container>
	);
};

export default Games;
