import React, { useState } from 'react';
import PaperSearch from './components/PaperSearch';
import PaperDetails from './components/PaperDetails';
import NetworkVisualization from './components/NetworkVisualization';
import './App.css';

function App() {
  const [paperData, setPaperData] = useState(null);

  const handlePaperSearch = async (arxivId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/paper/${arxivId}`);
      const data = await response.json();
      setPaperData(data);
    } catch (error) {
      console.error('Error fetching paper:', error);
      alert('Error fetching paper details');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>PaperWeb: Mapping the Future of Research</h1>
      </header>
      <main>
        <PaperSearch onSearch={handlePaperSearch} />
        {paperData && paperData.mainPaper && (
          <>
            <PaperDetails paper={paperData.mainPaper} />
            <NetworkVisualization data={paperData} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;