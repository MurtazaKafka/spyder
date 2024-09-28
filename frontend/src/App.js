import React, { useState } from 'react';
import PaperSearch from './components/PaperSearch';
import NetworkVisualization from './components/NetworkVisualization';
import './App.css';

function App() {
  const [graphData, setGraphData] = useState(null);

  const handlePaperSearch = async (arxivId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/paper/${arxivId}`);
      const data = await response.json();
      setGraphData(data);
    } catch (error) {
      console.error('Error fetching paper:', error);
      alert('Error fetching paper details');
    }
  };

  const handleNodeClick = (arxivId) => {
    handlePaperSearch(arxivId);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>PaperWeb: Mapping the Future of Research</h1>
      </header>
      <main>
        <PaperSearch onSearch={handlePaperSearch} />
        {graphData && (
          <NetworkVisualization data={graphData} onNodeClick={handleNodeClick} />
        )}
      </main>
    </div>
  );
}

export default App;