import { React, useEffect, useState } from "react";

import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";

import axios from "axios";

const Standings = () => {

	const [standings, setStandings] = useState([]);

	useEffect(() => {
		axios.get("http://localhost:65535/standings")
			.then((res) => {
				setStandings(res.data);
			})
			.catch((err) => {
				console.error(err);
			});
	}, []);

	return (
		<Card>
			<Card.Header as="h5">Standings</Card.Header>
			{standings.length !== 0 ?
				<Card.Body style={{ paddingTop: 0 }}>
					<Table striped bordered style={{ marginTop: "20px" }}>
						<thead>
							<tr>
								<th>Team</th>
								<th>Games Played</th>
								<th>Wins</th>
								<th>Draws</th>
								<th>Losses</th>
							</tr>
						</thead>
						<tbody>
							{standings.map((row, i) => {
								return (
									<tr key={`std-row-${i}`}>
										<td>{row.teamname}</td>
										<td>{row.gamesplayed}</td>
										<td>{row.wincount}</td>
										<td>{row.drawcount}</td>
										<td>{row.losscount}</td>
									</tr>	
								);
							})}
						</tbody>
					</Table>
				</Card.Body> :
				<div style={{ padding: "100px" }}>
					<Spinner animation="border"/>
				</div>}
		</Card>
	);
};

export default Standings;
