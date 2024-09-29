const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const cors = require('cors');
const natural = require('natural');

const dbModule = require('./db');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

async function fetchPaperDetails(arxivId) {
    const response = await axios.get(`http://export.arxiv.org/api/query?id_list=${arxivId}`);
    const result = await xml2js.parseStringPromise(response.data);
    const entry = result.feed.entry[0];

    await dbModule.connectToDB();
    const dbRes = await dbModule.searchInDB('papers', { id: arxivId });
    if (dbRes.length > 0) {
      console.log('Data already in DB:', dbRes[0]);
      return dbRes[0];
    }
  
  const data = {
    id: arxivId,
    title: entry.title[0],
    authors: entry.author.map(author => author.name[0]),
    abstract: entry.summary[0],
    link: entry.id[0],
    categories: entry.category.map(cat => cat.$.term)
  }

  try {
    await dbModule.connectToDB();
    const db = dbModule.getDB();

    const result = await db.collection('papers').insertOne(data); 
    console.log('Data inserted:', result.insertedId);

  } catch (error) {
    console.error('Error inserting data:', error);
  }

  return data;
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



async function predictFutureWorks(paper, relatedPapers) {
    const allAbstracts = [paper.abstract, ...relatedPapers.map(p => p.abstract)].join(' ');
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(allAbstracts.toLowerCase());
  
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const filteredTokens = tokens.filter(token => token.length > 3 && !stopWords.has(token));
  
    const tokenFrequency = {};
    filteredTokens.forEach(token => {
      tokenFrequency[token] = (tokenFrequency[token] || 0) + 1;
    });
  
    const sortedTokens = Object.entries(tokenFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([token]) => token);
  
    const futureSuggestions = [
      `Exploring the impact of ${sortedTokens[0]} on ${sortedTokens[1]} in ${paper.categories[0]}`,
      `Developing new methods for ${sortedTokens[2]} analysis in the context of ${sortedTokens[3]}`,
      `Investigating the relationship between ${sortedTokens[4]} and ${sortedTokens[5]} in ${paper.categories[0]}`,
      `Applying ${sortedTokens[6]} techniques to improve ${sortedTokens[7]} in ${paper.title.split(' ').slice(0, 3).join(' ')}`,
      `Extending the current work on ${sortedTokens[8]} to include ${sortedTokens[9]} considerations`
    ];
  
    return futureSuggestions;
  }



  async function suggestCollaborators(paper, relatedPapers) {
    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();
  
    // Add the main paper's abstract to the TF-IDF model
    tfidf.addDocument(paper.abstract);
  
    // Create a map to store potential collaborators
    const collaborators = new Map();
  
    // Process related papers
    relatedPapers.forEach((relatedPaper, index) => {
      // Add the related paper's abstract to the TF-IDF model
      tfidf.addDocument(relatedPaper.abstract);
  
      // Calculate similarity between the main paper and the related paper
      const similarity = calculateSimilarity(tfidf, 0, index + 1);
  
      // Add authors of the related paper as potential collaborators
      relatedPaper.authors.forEach(author => {
        if (!paper.authors.includes(author)) {
          const currentScore = collaborators.get(author) || 0;
          collaborators.set(author, currentScore + similarity);
        }
      });
    });
  
    // Sort collaborators by score and return top 5
    const sortedCollaborators = Array.from(collaborators.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, score]) => ({
        name,
        score: score.toFixed(2),
        reason: `High similarity in research interests and methodologies`
      }));
  
    return sortedCollaborators;
  }
  
  function calculateSimilarity(tfidf, doc1Index, doc2Index) {
    const terms1 = new Set(tfidf.listTerms(doc1Index).map(item => item.term));
    const terms2 = new Set(tfidf.listTerms(doc2Index).map(item => item.term));
    const intersection = new Set([...terms1].filter(term => terms2.has(term)));
    return intersection.size / (Math.sqrt(terms1.size) * Math.sqrt(terms2.size));
  }


  app.get('/api/paper/:id', async (req, res) => {
    try {
      const arxivId = req.params.id;
      const graph = await recursiveSearch(arxivId);
      const centralPaper = graph.nodes.find(node => node.id === arxivId);
      const relatedPapers = graph.nodes.filter(node => node.id !== arxivId);
      
      const collaboratorSuggestions = await suggestCollaborators(centralPaper, relatedPapers);
      
      res.json({
        ...graph,
        collaboratorSuggestions
      });
    } catch (error) {
      console.error('Detailed error:', error);
      res.status(500).json({ error: 'An error occurred while processing your request', details: error.message, stack: error.stack });
    }
  });

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});