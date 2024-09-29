import React, { useState, useEffect, useRef } from "react";
import NetworkVisualization from "../components/NetworkVisualization";
import Navbar from "../components/Navbar";
import PaperDetails from "../components/PaperDetails";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

const Home = () => {
  const [arxivId, setArxivId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [centerNodeId, setCenterNodeId] = useState(null);
  const [fileDisabled, setFileDisabled] = useState(false);
  const [collaboratorSuggestions, setCollaboratorSuggestions] = useState(null);
  const [file, setFile] = useState(null); // For storing the uploaded file
  const [flowchartImage, setFlowchartImage] = useState(null); // For storing the flowchart image URL

  const paperDetailsRef = useRef(null);

  useEffect(() => {
    if (graphData && graphData.nodes?.length > 0) {
      setSelectedPaper(graphData.nodes[0]);
      setCenterNodeId(graphData.nodes[0].id);
      setCollaboratorSuggestions(graphData.collaboratorSuggestions);
    }
  }, [graphData]);

  const fetchPaperNetwork = async (arxivId) => {
    console.log(arxivId);
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_URL}/api/paper/${arxivId}`
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
    fetchPaperNetwork(arxivId);
  };

  const handlePaperSearchwithID = (nodeId) => {
    console.log("ARXIV ID", nodeId);
    fetchPaperNetwork(nodeId.replace("/", "%2F"));
  };

  const handleNodeClick = (nodeId) => {
    const clickedPaper = graphData.nodes?.find((node) => node.id === nodeId);
    setSelectedPaper(clickedPaper);
    if (nodeId !== centerNodeId) {
      setArxivId(nodeId);
      handlePaperSearchwithID(nodeId);
      if (paperDetailsRef.current) {
        paperDetailsRef.current.scrollIntoView({ behavior: "smooth" });
      }
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

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFile(uploadedFile);
      setFileDisabled(true);
      handleFileUpload(uploadedFile); // Upload the file immediately after selection
    } else {
      toast.error("Please upload a valid PDF file.");
    }
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_PYTHON_URL}/extract_text/`,
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("RESPONSE: " + response.status);
      if (response.status !== 200) {
        throw new Error("File upload failed.");
      }

      const extractedText = await response.text();
      console.log("Extracted Text:", extractedText);

      await generateFlowchart(extractedText);

      toast.success("File uploaded and flowchart generated successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error extracting text from the PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateFlowchart = async (extractedText) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_URL}/api/generate-flowchart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: extractedText }),
        }
      );

      if (!response.ok) {
        throw new Error("Flowchart generation failed.");
      }

      const imageBlob = await response.blob(); // Get the image as a Blob
      const imageUrl = URL.createObjectURL(imageBlob); // Create a URL for the Blob
      setFlowchartImage(imageUrl); // Set the image URL for display
    } catch (error) {
      console.error("Error generating flowchart:", error);
      toast.error("Error generating flowchart. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col spyder-app text-text-color">
      <Navbar />
      <main className="flex-grow flex flex-col items-center px-4 py-8">
        <div className="bg-opacity-70 rounded-lg w-full max-w-2xl mb-2">
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
              onChange={handleFileChange}
              disabled={fileDisabled}
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

        {loading ? ( // Show the spinner if loading
          <div className="mt-4">
            <Spinner />
          </div>
        ) : (
          graphData && arxivId && ( // Show the NetworkVisualization if graphData is available
            <div className="mt-2 w-3/4 max-w-4xl bg-white rounded-lg flex mx-auto">
              <NetworkVisualization
                data={graphData}
                onNodeClick={handleNodeClick}
                centerNodeId={centerNodeId}
              />
            </div>
          )
        )}

        {flowchartImage && (
          <div className="mt-8 h-auto rounded-lg w-full overflow-x-auto">
            <img
              src={flowchartImage}
              alt="Generated Flowchart"
              className="w-auto h-auto"
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
