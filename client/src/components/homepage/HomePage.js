import { React, useEffect, useState } from "react";

import Standings from "./Standings";
import RecentGames from "./RecentGames";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Table from "react-bootstrap/Table";

import axios from "axios";

const HomePage = () => {
	const [maxGoals, setMaxGoals] = useState([]);

	useEffect(() => {
		axios.get("http://localhost:65535/max-avg-goals-per-game")
			.then((res) => {
				setMaxGoals(res.data);
			})
			.catch((err) => {
				console.error(err);
			});
	}, []);

	const [teamsByCoachExp, setTeamsByCoachExp] = useState([]);

	useEffect(() => {
		axios.get("http://localhost:65535/teams-by-coach-exp")
			.then((res) => {
				setTeamsByCoachExp(res.data);
			})
			.catch((err) => {
				console.error(err);
			});
	}, []);

	const [refsInAllGames, setRefsInAllGames] = useState([]);

	useEffect(() => {
		axios.get("http://localhost:65535/refs-in-all-games")
			.then((res) => {
				setRefsInAllGames(res.data);
			})
			.catch((err) => {
				console.error(err);
			});
	}, []);	

	return (
		<Container style={{ marginTop: "20px" }}>
			<Row>
				<Col>
					<Card>
						<Card.Header as="h5">Current News</Card.Header>	
							<Card.Body>
								{(maxGoals.length !== 0 && teamsByCoachExp.length !== 0 && refsInAllGames.length !== 0) ?
									<Container>
										<Card.Title>Championship Favourites</Card.Title>
										<Card.Text>
											Here is the championship favourite for this season: 
										</Card.Text>
										<Alert variant={"success"}>
												{maxGoals.map((n, i) => {
													return (
														<strong key={`mg-${i}`}>{n.team}: {n.avggoalspergame} average goals per game</strong>
													);
												})}
												<br></br>
												<div>
													This team features an average goals scored per game as the maximum over all the teams' average goals per game across the whole league!
												</div>
										</Alert>
										<Card.Title>
											Masterminds On and Off the Field
										</Card.Title>
										<Card.Text>
											Check out which teams have the most experienced coaching staff. These teams feature an average coaching experience time of at least 15 years!
										</Card.Text>
										<Container style={{ paddingLeft: 0, paddingRight: "50%" }}>
											<Table striped bordered style={{ marginTop: "20px" }}>
												<thead>
													<tr>
														<th>Team</th>
														<th>Average Coach Exp (years)</th>
													</tr>
												</thead>
												<tbody>
													{teamsByCoachExp.map((row, i) => {
														return (
															<tr key={`exp-row-${i}`}>
																<td>{row.current_team}</td>
																<td>{row.avgcoachingyears}</td>
															</tr>	
														);
													})}
												</tbody>
											</Table>
										</Container>
										<Card.Title>
											Relentless Referees
										</Card.Title>
										<Card.Text>
											No game can run without referees. This season, these are referees who've refereed every game.
										</Card.Text>
										<Container style={{ paddingLeft: 0, paddingRight: "50%" }}>
											<Table striped bordered style={{ marginTop: "20px" }}>
												<thead>
													<tr>
														<th>Referee</th>
														<th>Certification Level</th>
													</tr>
												</thead>
												<tbody>
													{refsInAllGames.map((row, i) => {
														return (
															<tr key={`exp-row-${i}`}>
																<td>{row.name}</td>
																<td>{row.certification_level}</td>
															</tr>	
														);
													})}
												</tbody>
											</Table>
										</Container>
									</Container> :
									<div style={{ padding: "50px" }}>
										<Spinner animation="border"/>
									</div>}
									{/* // TODO ADD COACH EXPS */}
							</Card.Body> 
					</Card>
				</Col>
			</Row>
			<Row style={{ marginTop: "20px" }}>
				<Col>
					<Standings />
				</Col>
				<Col>
					<RecentGames />
				</Col>
			</Row>
		</Container>
	);
};

export default HomePage;
