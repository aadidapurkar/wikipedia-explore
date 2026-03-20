import { Network } from "vis-network";
import type { State, Topic } from "./types";
import { setVisibility, shuffleArray } from "./util";

let graph: Network | null = null;
let currentActiveNodeId: string | null = null; 
let pulsePhase = 0; 
let isAnimating = false;

const animatePulse = () => {
  pulsePhase += 0.08; 
  if (graph && currentActiveNodeId) {
    graph.redraw();
  }
  requestAnimationFrame(animatePulse);
};

export const render = (s: State) => {
  // HTML elems
  const topicContainer = document.getElementById("topicContainer")!;
  const subtopicContainer = document.getElementById("subtopicContainer")!;
  const topicText = document.getElementsByClassName("topicText")[0]!;
  const selectOrder = document.getElementById("order")!;
  const explorationGraphDiv = document.getElementById("explorationGraph")!;
  const btnDL = document.getElementById("btnDownload")! as HTMLButtonElement;
  const explorationContainer = document.getElementById("explorationContainer")!;
  const loader = document.getElementById("loader")!;

  // make elements visible only once a topic is explored
  if (s.currTopic !== undefined) {
    setVisibility([topicContainer,selectOrder,btnDL,explorationContainer],"visible");
  }

  if (s.isLoading) {
    loader.classList.remove("hidden");
    setVisibility([topicContainer, subtopicContainer, explorationContainer, explorationGraphDiv, btnDL, selectOrder], "hidden");
    return; 
  } else {
    loader.classList.add("hidden");
    setVisibility([topicContainer, subtopicContainer, explorationContainer, explorationGraphDiv, btnDL, selectOrder], "visible");
  }

  // extra guard check
  if (s.currTopic === undefined || s.topics.length === 0) {
    return;
  }
  
  currentActiveNodeId = s.topics[s.currTopic!].title; 
  topicText.textContent = s.topics[s.currTopic!].title;
  topicText.id = `${s.currTopic!}`;

  // set subtopics
  subtopicContainer.innerHTML = "";
  const topic: Topic = s.topics[s.currTopic!];
  const shuffledTopics = s.pref === "random"
      ? shuffleArray<string>(topic.subtopics)
      : topic.subtopics;
  const slicedTopics = shuffledTopics.slice(0, s.limit);
  const subtopicElems = slicedTopics.map((subtopic: string) => {
    const p = document.createElement("p");
    p.id = subtopic;
    p.textContent = subtopic;
    return p;
  });

  subtopicContainer.append(...subtopicElems); 
  const highlightedNodes = s.graph.nodes.map(node => {
      if (node.id === currentActiveNodeId) {
        return { 
          ...node, 
          color: { 
            background: "#FFA500",
            border: "#FF8C00",    
            highlight: { background: "#FFA500", border: "#FF8C00" }
          } 
        };
      }
      return node;
    });
  // Render graph
  if (!graph) {
    graph = new Network(
      explorationGraphDiv,
      { nodes: highlightedNodes, edges: s.graph.edges },
      {
        nodes: {
          color: "#949494",
          shape: "dot",
          size: 16,
          widthConstraint: { maximum: 75 }
        },
        physics: {
          enabled: true,
          barnesHut: {
            gravitationalConstant: -1000,
            centralGravity: 0.5,
            springLength: 70,
          },
        },
        interaction: { hover: true },
      },
    );

    graph.on("beforeDrawing", (ctx) => {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#fff"; 
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      
      if (currentActiveNodeId) {
        const positions = graph!.getPositions([currentActiveNodeId]);
        const pos = positions[currentActiveNodeId];
        
        if (pos) {
          const radius = 25 + Math.sin(pulsePhase) * 6; 
          const opacity = 0.4 + Math.sin(pulsePhase) * 0.2; 
          
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = `rgba(255, 165, 0, ${opacity})`; 
          ctx.fill();
        }
      }
    });

    graph.on("stabilizationIterationsDone", () => {
      graph!.setSize("100%", "100%");
      graph!.redraw();
      graph!.fit({ animation: true });
    });

    const resizeObserver = new ResizeObserver(() => {
      graph!.setSize("100%", "100%");
      graph!.redraw();
      graph!.fit();
    });
    resizeObserver.observe(explorationGraphDiv!);

    graph.on("dragEnd", () => {
      setTimeout(() => graph!.fit({ animation: true }), 100);
    });

    if (!isAnimating) {
      isAnimating = true;
      animatePulse();
    }
  } else {
    graph.setData({ nodes: highlightedNodes, edges: s.graph.edges });
  }
};