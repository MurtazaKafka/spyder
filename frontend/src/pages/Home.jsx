import React, { useState, useEffect, useRef } from "react";
import NetworkVisualization from "../components/NetworkVisualization";
import Navbar from "../components/Navbar";
import PaperDetails from "../components/PaperDetails";
import { toast } from "react-toastify";

const Home = () => {
  const [arxivId, setArxivId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [centerNodeId, setCenterNodeId] = useState(null);
  const [fileDisabled, setFileDisabled] = useState(false);
  const [collaboratorSuggestions, setCollaboratorSuggestions] = useState(null);

  const paperDetailsRef = useRef(null);

  useEffect(() => {
    if (graphData && graphData.nodes?.length > 0) {
      setSelectedPaper(graphData.nodes[0]);
      setCenterNodeId(graphData.nodes[0].id);
      setCollaboratorSuggestions(graphData.collaboratorSuggestions);
    }
  }, [graphData]);

  const fetchPaperNetwork = async (arxivId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/paper/${arxivId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setGraphData(data);
      setCenterNodeId(arxivId);
      setCollaboratorSuggestions(data.collaboratorSuggestions);
    } catch (error) {
      console.error("Error fetching paper:", error);
      toast.error("Error fetching paper details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaperSearch = () => {
    console.log("ARVIX ID", arxivId);
    fetchPaperNetwork(arxivId.replace('/', "%2F"));
  };

  const handleNodeClick = (nodeId) => {
    const clickedPaper = graphData.nodes?.find((node) => node.id === nodeId);
    setSelectedPaper(clickedPaper);
    if (nodeId !== centerNodeId) {
      handlePaperSearch(nodeId);
      setTimeout(() => {
        if (paperDetailsRef.current) {
          paperDetailsRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 1000);
    } else {
      if (paperDetailsRef.current) {
        paperDetailsRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleInputChange = (e) => {
    setArxivId(e.target.value);
    setFileDisabled(e.target.value ? true : false);
  };

  const handleFileUploadClick = () => {
    setArxivId(null);
    setFileDisabled(false);
  };

  return (
    <div className="min-h-screen flex flex-col spyder-app text-text-color">
      <Navbar />
      <main className="flex-grow flex flex-col items-center px-4 py-8">
        <div className="bg-opacity-70 rounded-lg w-full max-w-2xl mb-2"> {/* Adjusted margin */}
          <div className="mb-6">
            <h2 className="text-xl mb-2">Enter arXiv ID:</h2>
            <div className="flex space-x-1 items-center rounded-md">
              <input
                type="text"
                value={arxivId || ""}
                onChange={handleInputChange}
                placeholder="Enter arXiv ID"
                className="flex-grow px-4 py-2 rounded-sm text-black focus:outline-none"
              />
              <button
                className={`bg-accent-color text-white px-6 py-2 rounded-md transition-colors ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
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
          </div>

          <div>
            <p>
              <b>Or</b>{" "}
              <span
                className="text-link text-accent-color underline cursor-pointer"
                onClick={() => document.getElementById("fileInput").click()}
              >
                upload
              </span>{" "}
              a scanned document
            </p>
            <input
              type="file"
              accept=".pdf"
              id="fileInput"
              className="hidden"
            />
          </div>
        </div>

        <div ref={paperDetailsRef}>
          {selectedPaper && (
            <PaperDetails
              paper={selectedPaper}
              collaboratorSuggestions={collaboratorSuggestions}
            />
          )}
        </div>

        {graphData && arxivId && (
          <div className="mt-2 w-3/4 max-w-4xl bg-white rounded-lg flex mx-auto"> {/* Adjusted margin */}
            <NetworkVisualization
              data={graphData}
              onNodeClick={handleNodeClick}
              centerNodeId={centerNodeId}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
