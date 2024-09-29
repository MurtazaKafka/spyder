import React from 'react';

function PaperDetails({ paper }) {
  if (!paper) {
    return <div>Select a paper to view details</div>;
  }

  return (
    <div className="paper-details">
      <h2>{paper.title}</h2>
      <p><strong>Authors:</strong> {paper.authors.join(', ')}</p>
      <p><strong>Categories:</strong> {paper.categories.join(', ')}</p>
      <p><strong>Abstract:</strong> {paper.abstract}</p>
      <a href={paper.link} target="_blank" rel="noopener noreferrer">View on arXiv</a>
    </div>
  );
}

export default PaperDetails;