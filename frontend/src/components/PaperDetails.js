import React from 'react';

function PaperDetails({ paper, collaboratorSuggestions }) {
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
      
      {collaboratorSuggestions && collaboratorSuggestions.length > 0 && (
        <div className="collaborator-suggestions">
          <h3>Potential Collaborators</h3>
          <ul>
            {collaboratorSuggestions.map((collaborator, index) => (
              <li key={index}>
                <strong>{collaborator.name}</strong> (Similarity Score: {collaborator.score})
                <br />
                <em>Reason: {collaborator.reason}</em>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PaperDetails;