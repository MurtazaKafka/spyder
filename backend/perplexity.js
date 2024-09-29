const axios = require('axios');
const puppeteer = require('puppeteer');
const path = require("path");
const fs = require("fs");

async function generateFlowchartFromPaper(content) {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error("PERPLEXITY_API_KEY environment variable not set");
    }
  
    const prompt = `
    Summarize the following academic paper's content and generate a structured outline 
    with main topics and subtopics. Let the summary be informative. Format the outline as 
    a JSON object where keys are main topics and values are arrays of subtopics. Be very 
    creative!
  
    Content:
    ${content}
    `;
  
    try {
      const response = await axios.post('https://api.perplexity.ai/chat/completions', {
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [{ role: 'user', content: prompt }],
        temperature: '0.2',
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
  
      const responseContent = response.data.choices[0].message.content;
      console.log("API Response:", responseContent);
  
      let outline;
      try {
        outline = JSON.parse(responseContent);
      } catch (parseError) {
        console.error("Failed to parse API response as JSON:", parseError);
        console.log("Attempting to extract JSON from the response...");
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          outline = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not extract valid JSON from the response");
        }
      }
  
      // Generate mermaid flowchart
      let flowchartCode = 'graph TD\n';
      flowchartCode += `start[Start]\n`;
  
      Object.entries(outline).forEach(([mainTopic, subtopics], index) => {
        const mainNodeId = `main${index}`;
        
        // Check if the main topic contains parentheses and wrap it in quotes if needed
        const sanitizedMainTopic = mainTopic.includes('(') || mainTopic.includes(')')
          ? `"${mainTopic}"`
          : mainTopic;
      
        flowchartCode += `${mainNodeId}[${sanitizedMainTopic}]\n`;
        flowchartCode += `start --> ${mainNodeId}\n`;
      
        subtopics.forEach((subtopic, subIndex) => {
          const subNodeId = `sub${index}_${subIndex}`;
      
          // Check if the subtopic contains parentheses and wrap it in quotes if needed
          const sanitizedSubtopic = subtopic.includes('(') || subtopic.includes(')')
            ? `"${subtopic}"`
            : subtopic;
      
          flowchartCode += `${subNodeId}[${sanitizedSubtopic}]\n`;
          flowchartCode += `${mainNodeId} --> ${subNodeId}\n`;
        });
      });
      
    
      return flowchartCode;
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

async function renderMermaidFlowchart(flowchartCode) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Create an HTML page with the Mermaid flowchart
  const html = `
    <!DOCTYPE html>
    <html>
      <body>
        <div class="mermaid">
          ${flowchartCode}
        </div>
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        <script>
          mermaid.initialize({ startOnLoad: true });
        </script>
      </body>
    </html>
  `;

  await page.setContent(html);
  
  // Wait for Mermaid to render the flowchart
  await page.waitForSelector('.mermaid svg');

  // Capture a screenshot of the rendered flowchart
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 4 });

  const element = await page.$('.mermaid');
  await element.screenshot({ path: 'flowchart.png', type: 'png'});


  await browser.close();
}


module.exports={
  generateFlowchartFromPaper,
  renderMermaidFlowchart
}