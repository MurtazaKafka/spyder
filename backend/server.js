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
    link: entry.id[0],
    categories: entry.category.map(cat => cat.$.term)
  };
}

async function fetchRelatedPapers(category, excludeId) {
    try {
      const response = await axios.get(`http://export.arxiv.org/api/query?search_query=cat:${category}&max_results=5`);
      const result = await xml2js.parseStringPromise(response.data);
      return result.feed.entry
        .filter(entry => entry.id[0] !== excludeId)
        .map(entry => ({
          id: entry.id[0].split('/abs/')[1],
          title: entry.title[0],
          authors: entry.author.map(author => author.name[0]),
          categories: entry.category.map(cat => cat.$.term)
        }));
    } catch (error) {
      console.error('Error fetching related papers:', error);
      throw error;
    }
  }


  app.get('/api/paper/:id', async (req, res) => {
    try {
      const arxivId = req.params.id;
      console.log(`Fetching paper details for ID: ${arxivId}`);
      const paper = await fetchPaperDetails(arxivId);
      console.log(`Fetched main paper details: ${JSON.stringify(paper)}`);
      const relatedPapers = await fetchRelatedPapers(paper.categories[0], paper.id);
      console.log(`Fetched related papers: ${JSON.stringify(relatedPapers)}`);
  
      res.json({
        mainPaper: paper,
        relatedPapers: relatedPapers
      });
    } catch (error) {
      console.error('Detailed error:', error);
      res.status(500).json({ error: 'An error occurred while processing your request', details: error.message, stack: error.stack });
    }
  });

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});