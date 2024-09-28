import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import "./App.css"

function App() {

  return (
    <Router>
      <Routes>
        <Route
          path="/team"
          element={<Home />}
        />
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/mission"
          element={<Home />}
        />
      </Routes>
    </Router>
  );
}

export default App;
