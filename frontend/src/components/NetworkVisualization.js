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

      if (!data.mainPaper || !data.relatedPapers) {
        console.error('Invalid data structure:', data);
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .text('Error: Invalid data structure');
        return;
      }

      const nodes = [
        { ...data.mainPaper, group: 'main' },
        ...data.relatedPapers.map(paper => ({ ...paper, group: 'related' }))
      ];

      const links = data.relatedPapers.map(paper => ({
        source: data.mainPaper.id,
        target: paper.id,
        type: 'related'
      }));

      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(150))
        .force('charge', d3.forceManyBody().strength(-500))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(130));

      const link = svg.append('g')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 2);

      const node = svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', d => d.group === 'main' ? 30 : 20)
        .attr('fill', d => d.group === 'main' ? '#ff0000' : '#0000ff')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));

      const label = svg.append('g')
        .selectAll('text')
        .data(nodes)
        .enter().append('text')
        .text(d =>{
          let splitTitle = (d.title || '').split(" ");
          return splitTitle[0] + " "+splitTitle[1];
        })
        .attr('font-size', '10px')
        .attr('dx', 35)
        .attr('dy', 0);

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
  }, [data]);

  return <svg ref={svgRef}></svg>;
}

export default NetworkVisualization;