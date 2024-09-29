import React, { useState, useEffect } from 'react';
import PaperSearch from './components/PaperSearch';
import PaperDetails from './components/PaperDetails';
import NetworkVisualization from './components/NetworkVisualization';
import './App.css';

function App() {
  const [graphData, setGraphData] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [centerNodeId, setCenterNodeId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collaboratorSuggestions, setCollaboratorSuggestions] = useState(null);

  useEffect(() => {
    if (graphData && graphData.nodes.length > 0) {
      setSelectedPaper(graphData.nodes[0]);
      setCenterNodeId(graphData.nodes[0].id);
      setCollaboratorSuggestions(graphData.collaboratorSuggestions);
    }
  }, [graphData]);

  const fetchPaperNetwork = async (arxivId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/paper/${arxivId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setGraphData(data);
      setCenterNodeId(arxivId);
      setCollaboratorSuggestions(data.collaboratorSuggestions);
    } catch (error) {
      console.error('Error fetching paper:', error);
      setError('Error fetching paper details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaperSearch = (arxivId) => {
    fetchPaperNetwork(arxivId);
  };

  const handleNodeClick = (nodeId) => {
    const clickedPaper = graphData.nodes.find(node => node.id === nodeId);
    setSelectedPaper(clickedPaper);
    if (nodeId !== centerNodeId) {
      fetchPaperNetwork(nodeId);
    }
  };

  return (
    <div className="App">
      <div className="background-art"></div>
      <header className="App-header">
        <h1>PaperWeb</h1>
      </header>
      <main>
        <div className="search-container">
          <PaperSearch onSearch={handlePaperSearch} />
        </div>
        {error && <div className="error-message">{error}</div>}
        {isLoading ? (
          <div className="loading-message">Mapping the research landscape...</div>
        ) : (
          <>
            {selectedPaper && <PaperDetails paper={selectedPaper} collaboratorSuggestions={collaboratorSuggestions} />}
            {graphData && (
              <div className="network-container">
                <NetworkVisualization 
                  data={graphData} 
                  onNodeClick={handleNodeClick} 
                  centerNodeId={centerNodeId}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;