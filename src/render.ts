import { Network } from "vis-network";
import type { State, Topic } from "./types";
import { shuffleArray } from "./util";

// A function which takes a state and updates the view correspondingly

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
  // make elements visible once a topic is explored
  if (s.currTopic !== undefined) {
    topicContainer.style.visibility = "visible";
    stps.style.visibility = "visible";
    selectOrder.style.visibility = "visible";
    btnDL.style.visibility = "visible";
    explorationContainer.style.visibility = "visible";
  }
  // loading 
  if (s.isLoading) {
    // to do this is a lot of dry code and can be made more concise
    console.log("still loading")
    loader.classList.remove("hidden");
    console.log("content is loaded")
    topicContainer.style.visibility = "hidden"
    subtopicContainer.style.visibility = "hidden"
    explorationContainer.style.visibility = "hidden"
    explorationGraphDiv.style.visibility = "hidden"
    btnDL.style.visibility = "hidden"
    stps.style.visibility = "hidden";
    selectOrder.style.visibility = "hidden"
    return; // prevent below code from executing
  } else {
    loader.classList.add("hidden");
    topicContainer.style.visibility = "visible"
    subtopicContainer.style.visibility = "visible"
    explorationContainer.style.visibility = "visible"
    explorationGraphDiv.style.visibility = "visible"
    btnDL.style.visibility = "visible"
    stps.style.visibility = "visible";
    selectOrder.style.visibility = "visible"

  }
  // heading
  stepsText.textContent = `${s.currTopic!}`;
  topicText.textContent = s.topics[s.currTopic!].title;
  topicText.id = `${s.currTopic!}`;

  // subtopics (randomly shuffle before displaying)
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

  subtopicElems.forEach((st) => {
    subtopicContainer.appendChild(st);
  });

  explorationGraphDiv.innerHTML = "";
  const graph = new Network(
    explorationGraphDiv,
    { nodes: s.graph.nodes, edges: s.graph.edges },
    {
      nodes: {
        shape: "dot",
        size: 16,
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
    ctx.fillStyle = "#ffffff"; // Your desired background color
    ctx.fillRect(0, 0, width, height);
  });

  graph.on("stabilizationIterationsDone", () => {
    graph.setSize("100%", "100%");
    graph.redraw();
    graph.fit({ animation: true });
  });

  const resizeObserver = new ResizeObserver(() => {
    graph.setSize("100%", "100%"); // Quotes needed!
    graph.redraw();
    graph.fit();
  });
  resizeObserver.observe(explorationGraphDiv!);

  graph.on("dragEnd", () => {
    setTimeout(() => graph.fit({ animation: true }), 100);
  });
};
