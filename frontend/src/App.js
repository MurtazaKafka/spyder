import React, { useState } from 'react';
import "./App.css"

const SpyderApp = () => {
  const [arxivId, setArxivId] = useState('');

  return (
    <div className="spyder-app">
      <header>
        <div className="header-item">Our Team</div>
        <div className="header-item">
          Spyder
          <img src="/images/spyder.png" alt="Spider Icon" className="spider-icon" />
        </div>
        <div className="header-item">Our Mission</div>
      </header>
      
      <main>
        <div className="search-container">
          <h2>Enter ArXiV id:</h2>
          <input 
            type="text" 
            value={arxivId} 
            onChange={(e) => setArxivId(e.target.value)}
            placeholder="Enter ArXiV id"
          />
          <p>or upload scanned document</p>
        </div>
        
        <div className="action-buttons">
          <button className="contact-us">Contact Us</button>
          <button className="view-project">View Project</button>
        </div>
      </main>
      
      <footer>
        <div className="footer-left">
          <div className='footer-logo-holder'>
            <h2>Sypder</h2>
            <img src="/images/spyder.png" alt="Spyder Logo" className="footer-logo" />
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

export default SpyderApp;