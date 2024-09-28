function PaperDetails({ paper }) {
    if (!paper) {
      return <div>Loading paper details...</div>;
    }
  
    return (
      <div className="paper-details">
        <h2>{paper.title}</h2>
        <p><strong>Authors:</strong> {paper.authors.join(', ')}</p>
        <p><strong>Abstract:</strong> {paper.abstract}</p>
      </div>
    );
  }

export default PaperDetails;