import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import NavigationBar from "./components/NavigationBar";
import HomePage from "./components/homepage/HomePage";
import Athletes from "./components/athlete/Athletes";
import Games from "./components/games/Games";
import Locator from "./components/locator/Locator";
import Sponsors from "./components/sponsors/Sponsors";
import Advanced from "./components/advanced/Advanced";

const App = () => {
	return (
		<Router>
			<NavigationBar />
			<Routes>
				<Route exact path="/" element={<HomePage />} />
				<Route exact path="/athletes" element={<Athletes />} />
				<Route exact path="/games" element={<Games />} />
				<Route exact path="/locator" element={<Locator />} />
				<Route exact path="/sponsors" element={<Sponsors />} />
				<Route exact path="/advanced" element={<Advanced />} />
			</Routes>
		</Router>
	);
};

export default App;
