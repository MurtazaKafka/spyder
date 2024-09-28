const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

async function fetchPaperDetails(arxivId) {
  const response = await axios.get(`http://export.arxiv.org/api/query?id_list=${arxivId}`);
  const result = await xml2js.parseStringPromise(response.data);
  const entry = result.feed.entry[0];

  return {
    id: arxivId,
    title: entry.title[0],
    authors: entry.author.map(author => author.name[0]),
    abstract: entry.summary[0],
    link: entry.id[0]
  };
}

async function fetchCitations(arxivId) {
  try {
    const paperDetails = await fetchPaperDetails(arxivId);
    
    // Use Semantic Scholar API
    const semanticScholarResponse = await axios.get(`https://api.semanticscholar.org/graph/v1/paper/ARXIV:${arxivId}`, {
      params: {
        fields: 'citationCount,citations.title,citations.authors,citations.year,citations.externalIds,references.title,references.authors,references.year,references.externalIds'
      }
    });

    const semanticScholarData = semanticScholarResponse.data;

    const citedPapers = (semanticScholarData.references || []).map(ref => ({
      id: ref.externalIds?.ArXiv || ref.paperId,
      title: ref.title,
      authors: ref.authors?.map(author => author.name) || [],
      year: ref.year
    }));

    const citingPapers = (semanticScholarData.citations || []).map(citation => ({
      id: citation.externalIds?.ArXiv || citation.paperId,
      title: citation.title,
      authors: citation.authors?.map(author => author.name) || [],
      year: citation.year
    }));

    return {
      citedPapers,
      citingPapers,
      citationCount: semanticScholarData.citationCount
    };
  } catch (error) {
    console.error('Error fetching citations:', error);
    throw error;
  }
}

app.get('/api/paper/:id', async (req, res) => {
  try {
    const arxivId = req.params.id;
    const paper = await fetchPaperDetails(arxivId);
    const citationData = await fetchCitations(arxivId);

    res.json({
      mainPaper: paper,
      citedPapers: citationData.citedPapers,
      citingPapers: citationData.citingPapers,
      citationCount: citationData.citationCount
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});