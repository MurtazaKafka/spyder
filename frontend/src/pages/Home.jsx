import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Upload, Users, Crosshair } from "lucide-react";
import "../App.css";
import NetworkVisualization from "../components/NetworkVisualization";

const Home = () => {
  const [arxivId, setArxivId] = useState(null);
  const [paperData, setPaperData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileDisabled, setFileDisabled] = useState(false);

  const handlePaperSearch = async () => {
    if (!arxivId) return;
    setLoading(true); 
    try {
      const response = await fetch(`http://localhost:3001/api/paper/${arxivId}`);
      const data = await response.json();
      setPaperData(data);
    } catch (error) {
      console.error("Error fetching paper:", error);
      alert("Error fetching paper details");
    } finally {
      setLoading(false); 
    }
  };

  const handleInputChange = (e) => {
    setArxivId(e.target.value);
    if (e.target.value) {
      setFileDisabled(true);
    } else {
      setFileDisabled(false);
    }
  };

  const handleFileUploadClick = () => {
    setArxivId(null); // Clear input text
    setFileDisabled(false); // Enable file input
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br spyder-app text-white">
      <header className="bg-black bg-opacity-50 py-4 px-8 flex justify-between items-center">
        <Link
          to="/team"
          className="flex items-center space-x-2 hover:text-purple-300 transition-colors"
        >
          <Users size={24} />
          <span>Our Team</span>
        </Link>
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold">Spyder</span>
          <img src="/images/spyder.png" alt="Spider Icon" className="w-12 h-12" />
        </Link>
        <Link
          to="/mission"
          className="flex items-center space-x-2 hover:text-purple-300 transition-colors"
        >
          <Crosshair size={24} />
          <span>Our Mission</span>
        </Link>
      </header>

      <main className="flex-grow flex flex-col justify-center items-center px-4 py-8">
        <div className="bg-black bg-opacity-70 rounded-lg w-full max-w-2xl p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl mb-2">Enter ArXiV id:</h2>
            <div className="flex items-center bg-white rounded-md">
              <input
                type="text"
                value={arxivId || ""}
                onChange={handleInputChange}
                placeholder="Enter ArXiV id"
                className="flex-grow px-4 py-2 rounded-l-md text-black focus:outline-none"
              />
            </div>
          </div>

          <div>
            <p className="mb-2">Or upload a scanned document</p>
            <label
              className={`flex items-center justify-center w-full ${fileDisabled ? 'bg-gray-400' : 'bg-purple-600'} text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors cursor-pointer`}
            >
              <Upload size={20} className="mr-2" />
              <span>Choose File</span>
              <input type="file" accept=".pdf" className="hidden" disabled={fileDisabled} onClick={handleFileUploadClick} />
            </label>
          </div>
        </div>

        <div className="flex space-x-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
            Contact Us
          </button>
          <button
            className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handlePaperSearch}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="loader mr-2" />
                Loading...
              </span>
            ) : (
              "View Project"
            )}
          </button>
        </div>

        {paperData && arxivId && (
          <div className="mt-8 w-full bg-white p-6 rounded-lg flex justify-center items-center">
            <NetworkVisualization data={paperData} />
          </div>
        )}
      </main>

      <footer className="bg-black bg-opacity-50 py-6 px-8 flex flex-wrap justify-between items-start">
        <div className="w-full md:w-1/3 mb-6 md:mb-0">
          <div className="flex items-center mb-4">
            <h2 className="text-2xl font-bold mr-2">Spyder</h2>
            <img src="/images/spyder.png" alt="Spyder Logo" className="w-8 h-8" />
          </div>
          <div className="space-y-1 text-sm">
            <p>Alp (alniksarli@davidson.edu)</p>
            <p>Murtaza (munikzad@davidson.edu)</p>
            <p>Pacis (nkpacis@davidson.edu)</p>
            <p>Philo (phgabra@davidson.edu)</p>
          </div>
        </div>
        <div className="w-full md:w-2/3">
          <p className="mb-4 font-semibold">Thanks to...</p>
          <div className="flex flex-wrap gap-4">
            <img src="/images/perplexity.png" alt="Perplexity" className="h-12" />
            <img src="/images/perplexity2.png" alt="Perplexity" className="h-12" />
            <img src="/images/terraform.png" alt="Terraform" className="h-12" />
            <img src="/images/godaddy.png" alt="GoDaddy" className="h-12" />
            <img src="/images/mongo.png" alt="Mongo" className="h-12" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
