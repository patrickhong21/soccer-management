import React from "react";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

const NavigationBar = () => {
	return (
		<>
		<Navbar expand="lg" bg="dark" variant="dark">
			<Container>
				<Navbar.Brand href="/">BC Pro Soccer League</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="me-auto">
						<Nav.Link href="/athletes">Athletes</Nav.Link>
						<Nav.Link href="/games">Games</Nav.Link>
						<Nav.Link href="/locator">Locator</Nav.Link>
						<Nav.Link href="/sponsors">Sponsors</Nav.Link>
						<Nav.Link href="/advanced">Advanced</Nav.Link>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
		</>
	);
};

export default NavigationBar;
