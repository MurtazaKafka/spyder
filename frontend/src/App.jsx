import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import "./App.css"
import Team from "./pages/Team";
import Mission from "./pages/Mission";

function App() {

  return (
    <Router>
      <Routes>
        <Route
          path="/team"
          element={<Team />}
        />
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/mission"
          element={<Mission />}
        />
      </Routes>
    </Router>
  );
}

export default App;
