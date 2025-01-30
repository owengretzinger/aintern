import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import "./App.css";

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="nav-brand">
            <h1>(A)Intern</h1>
          </div>
          <div className="nav-links">
            <Link to="/">Join Meeting</Link>
            <Link to="/dashboard">Meeting History</Link>
            <Link to="/documents">Knowledge Base</Link>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/documents" element={<Documents />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
