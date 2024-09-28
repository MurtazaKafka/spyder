import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function NetworkVisualization({ data, onNodeClick }) {
  const svgRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (data && svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const width = 800;
      const height = 600;
      svg.attr('width', width).attr('height', height);

      const simulation = d3.forceSimulation(data.nodes)
        .force('link', d3.forceLink(data.links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(30));

      const link = svg.append('g')
        .selectAll('line')
        .data(data.links)
        .enter().append('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 1);

      const node = svg.append('g')
        .selectAll('circle')
        .data(data.nodes)
        .enter().append('circle')
        .attr('r', 10)
        .attr('fill', d => d.id === data.nodes[0].id ? '#ff0000' : '#0000ff')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))
        .on('click', (event, d) => {
          setSelectedNode(d);
          onNodeClick(d.id);
        });

      const label = svg.append('g')
        .selectAll('text')
        .data(data.nodes)
        .enter().append('text')
        .text(d => (d.title || '').substring(0, 20))
        .attr('font-size', '10px')
        .attr('dx', 15)
        .attr('dy', 4);

      node.append('title')
        .text(d => `${d.title || 'Untitled'}\nAuthors: ${(d.authors || []).join(', ') || 'Unknown'}`);

      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);

        label
          .attr('x', d => d.x)
          .attr('y', d => d.y);
      });

      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
    }
  }, [data, onNodeClick]);

  return (
    <div>
      <svg ref={svgRef}></svg>
      {selectedNode && (
        <div>
          <h3>{selectedNode.title}</h3>
          <p>Authors: {selectedNode.authors.join(', ')}</p>
          <p>Abstract: {selectedNode.abstract}</p>
          <a href={selectedNode.link} target="_blank" rel="noopener noreferrer">View on arXiv</a>
        </div>
      )}
    </div>
  );
}

export default NetworkVisualization;