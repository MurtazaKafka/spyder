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

async function fetchRelatedPapers(category, excludeId, maxResults = 8) {
    try {
      const response = await axios.get(`http://export.arxiv.org/api/query?search_query=cat:${category}&max_results=${maxResults}`);
      const result = await xml2js.parseStringPromise(response.data);
      return result.feed.entry
        .filter(entry => entry.id[0].split('/abs/')[1] !== excludeId)
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


async function recursiveSearch(arxivId, depth = 4, maxPapersPerLevel = 8) {
    const visited = new Set();
    const graph = { nodes: [], links: [] };
  
    async function search(id, currentDepth) {
      if (visited.has(id) || currentDepth > depth) return;
      visited.add(id);
  
      const paper = await fetchPaperDetails(id);
      graph.nodes.push(paper);
  
      if (currentDepth < depth) {
        const relatedPapers = await fetchRelatedPapers(paper.categories[0], id, maxPapersPerLevel);
        for (const relatedPaper of relatedPapers) {
          graph.links.push({ source: id, target: relatedPaper.id });
          await search(relatedPaper.id, currentDepth + 1);
        }
      }
    }
  
    await search(arxivId, 0);
    return graph;
  }


app.get('/api/paper/:id', async (req, res) => {
    try {
      const arxivId = req.params.id;
      const graph = await recursiveSearch(arxivId);
      res.json(graph);
    } catch (error) {
      console.error('Detailed error:', error);
      res.status(500).json({ error: 'An error occurred while processing your request', details: error.message, stack: error.stack });
    }
  });

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});