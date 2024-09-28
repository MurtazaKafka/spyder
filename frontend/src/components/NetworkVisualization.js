import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function NetworkVisualization({ data }) {
  const svgRef = useRef();

  useEffect(() => {
    if (data && svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Clear previous visualization

      const width = 800;
      const height = 600;
      svg.attr('width', width).attr('height', height);

      if (!data.mainPaper || !data.citedPapers || !data.citingPapers) {
        console.error('Invalid data structure:', data);
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .text('Error: Invalid data structure');
        return;
      }

      const nodeIds = new Set([
        data.mainPaper.id,
        ...data.citedPapers.map(p => p.id),
        ...data.citingPapers.map(p => p.id)
      ]);

      const nodes = [
        { ...data.mainPaper, group: 'main' },
        ...data.citedPapers.map(paper => ({ ...paper, group: 'cited' })),
        ...data.citingPapers.map(paper => ({ ...paper, group: 'citing' }))
      ];

      const links = [
        ...data.citedPapers
          .filter(paper => nodeIds.has(paper.id))
          .map(paper => ({ source: data.mainPaper.id, target: paper.id, type: 'cites' })),
        ...data.citingPapers
          .filter(paper => nodeIds.has(paper.id))
          .map(paper => ({ source: paper.id, target: data.mainPaper.id, type: 'cites' }))
      ];

      if (nodes.length === 0) {
        console.error('No valid nodes found');
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .text('No valid data to display');
        return;
      }

      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(30));

      const link = svg.append('g')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', d => Math.sqrt(d.value));

      const node = svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', d => d.group === 'main' ? 15 : 10)
        .attr('fill', d => {
          if (d.group === 'main') return '#ff0000';
          if (d.group === 'cited') return '#00ff00';
          return '#0000ff';
        })
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));

      const label = svg.append('g')
        .selectAll('text')
        .data(nodes)
        .enter().append('text')
        .text(d => (d.title || '').substring(0, 20))
        .attr('font-size', '10px')
        .attr('dx', 15)
        .attr('dy', 4);

      node.append('title')
        .text(d => `${d.title || 'Untitled'}\nAuthors: ${(d.authors || []).join(', ') || 'Unknown'}\nYear: ${d.year || 'N/A'}`);

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
  }, [data]);

  return <svg ref={svgRef}></svg>;
}

export default NetworkVisualization;