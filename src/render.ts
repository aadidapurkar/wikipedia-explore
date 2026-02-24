import { Network } from "vis-network";
import type { State, Topic } from "./types";
import { setVisibility, shuffleArray } from "./util";

// A function which takes a state and updates the view correspondingly

let graph: Network | null = null;
export const render = (s: State) => {
  // HTML elems
  const topicContainer = document.getElementById("topicContainer")!;
  const subtopicContainer = document.getElementById("subtopicContainer")!;
  const topicText = document.getElementsByClassName("topicText")[0]!;
  const stps = document.getElementById("stps")!;
  const stepsText = document.getElementById("stepsAway")!;
  const selectOrder = document.getElementById("order")!;
  const explorationGraphDiv = document.getElementById("explorationGraph")!;
  const btnDL = document.getElementById("btnDownload")! as HTMLButtonElement;
  const explorationContainer = document.getElementById("explorationContainer")!;
  const loader = document.getElementById("loader")!; // Select loader

  // make elements visible only once a topic is explored
  if (s.currTopic !== undefined) {
    setVisibility([topicContainer,stps,selectOrder,btnDL,explorationContainer],"visible")
  }


  if (s.isLoading) {
    loader.classList.remove("hidden");
    setVisibility([topicContainer, subtopicContainer, explorationContainer, explorationGraphDiv, btnDL, stps, selectOrder], "hidden")
    return; // prevent below code from executing
  } else {
    loader.classList.add("hidden");
    setVisibility([topicContainer, subtopicContainer, explorationContainer, explorationGraphDiv, btnDL, stps, selectOrder], "visible")
  }

  // extra guard check
  if (s.currTopic === undefined || s.topics.length === 0) {
    return;
  }

  // set heading
  stepsText.textContent = `${s.currTopic!}`;
  topicText.textContent = s.topics[s.currTopic!].title;
  topicText.id = `${s.currTopic!}`;

  // set subtopics (randomly shuffle before displaying if pref is random)
  subtopicContainer.innerHTML = "";
  const topic: Topic = s.topics[s.currTopic!];
  const shuffledTopics =
    s.pref === "random"
      ? shuffleArray<string>(topic.subtopics)
      : topic.subtopics;
  const slicedTopics = shuffledTopics.slice(0, s.limit);
  const subtopicElems = slicedTopics.map((subtopic: string) => {
    const p = document.createElement("p");
    p.id = subtopic;
    p.textContent = subtopic;
    return p;
  });

  subtopicContainer.append(...subtopicElems); // this has better DOM performance than appendChild 1 by 1 in a for loop

  // Render graph
  if (!graph) {
    // CASE Graph hasn't been initialised yet
    graph = new Network(
      explorationGraphDiv,
      { nodes: s.graph.nodes, edges: s.graph.edges },
      {
        nodes: {
          shape: "dot",
          size: 16,
          widthConstraint: {
            maximum: 75 // Force text wrapping for long topic names
          }
        },
        physics: {
          enabled: true,
          // Improving mobile visibility by spacing nodes out
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
      ctx.fillStyle = "#fff"; 
      ctx.fillRect(0, 0, width, height);
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
  } else {
    // Instead of recreating the graph, just update the node/edge data on subsequent renders
    graph.setData({ nodes: s.graph.nodes, edges: s.graph.edges });
  }
};
