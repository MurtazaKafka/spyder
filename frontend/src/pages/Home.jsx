import React, { useState } from "react";
import { Upload } from "lucide-react";
import "../App.css";
import NetworkVisualization from "../components/NetworkVisualization";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Home = () => {
  const [arxivId, setArxivId] = useState(null);
  const [paperData, setPaperData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileDisabled, setFileDisabled] = useState(false);

  const handlePaperSearch = async () => {
    if (!arxivId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/paper/${arxivId}`
      );
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
      <Navbar />
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
            <p className="mb-2"><b>Or</b> upload a scanned document</p>
            <label
              className={`flex items-center justify-center w-full ${
                fileDisabled ? "bg-gray-400" : "bg-purple-600"
              } text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors cursor-pointer`}
            >
              <Upload size={20} className="mr-2" />
              <span>Choose File</span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={fileDisabled}
                onClick={handleFileUploadClick}
              />
            </label>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handlePaperSearch}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="loader mr-2" />
                Loading...
              </span>
            ) : (
              "Search"
            )}
          </button>
        </div>

        {paperData && arxivId && (
          <div className="mt-8 w-full bg-white p-6 rounded-lg flex justify-center items-center">
            <NetworkVisualization data={paperData} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
