import React, { useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [arxivId, setArxivId] = useState("");

  return (
    <div className="spyder-app">
      <header>
        <Link to="/team" className="header-item">
          Our Team
        </Link>
        <Link to="/" className="header-item spider-icon-header">
          <p>Spyder</p>
          <img
            src="/images/spyder.png"
            alt="Spider Icon"
            className="spider-icon"
          />
        </Link>
        <Link to="/mission" className="header-item">
          Our Mission
        </Link>
      </header>

      <main>
        <div className="search-container">
          <div className="archive-id">
            <h2>Enter ArXiV id:</h2>
            <input
              type="text"
              value={arxivId}
              onChange={(e) => setArxivId(e.target.value)}
              placeholder="Enter ArXiV id"
            />
          </div>

          <p>Or upload a scanned document</p>
          <input type="file" accept=".pdf"></input>
        </div>

        <div className="action-buttons">
          <button className="contact-us">Contact Us</button>
          <button className="view-project">View Project</button>
        </div>
      </main>

      <footer>
        <div className="footer-left">
          <div className="footer-logo-holder">
            <h2>Sypder</h2>
            <img
              src="/images/spyder.png"
              alt="Spyder Logo"
              className="footer-logo"
            />
          </div>

          <div className="team-members">
            <p>Alp (alniksarli@davidson.edu)</p>
            <p>Murtaza (munikzad@davidson.edu)</p>
            <p>Pacis (nkpacis@davidson.edu)</p>
            <p>Philo (phgabra@davidson.edu)</p>
          </div>
        </div>
        <div className="footer-right">
          <p>Thanks to...</p>
          <div className="sponsor-logos">
            <img src="/images/perplexity.png" alt="Perplexity" />
            <img src="/images/perplexity2.png" alt="Perplexity" />
            <img src="/images/terraform.png" alt="Terraform" />
            <img src="/images/godaddy.png" alt="GoDaddy" />
            <img src="/images/mongo.png" alt="Mongo" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
