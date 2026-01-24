import { Network } from "vis-network";
import cytoscape from "cytoscape";
import type { State, Topic } from "./types";
import { shuffleArray } from "./util";

// A function which takes a state and updates view as necessary
export const render = (s: State) => {
  // HTML elems
  const topicContainer = document.getElementById("topicContainer")!;
  const subtopicContainer = document.getElementById("subtopicContainer")!;
  const topicText = document.getElementsByClassName("topicText")[0]!;
  const stps = document.getElementById("stps")!;
  const stepsText = document.getElementById("stepsAway")!;
  const selectOrder = document.getElementById("order")!;
  const explorationGraphDiv = document.getElementById("explorationGraph")!;

  //const topicChangeRequired : boolean = s.currTopic !== undefined && s.currTopic >= 0 && s.currTopic <= s.topics.length - 1 //&& s.currTopic != parseInt(topicText.id)
  const topicChangeRequired = true;

  if (s.currTopic !== undefined) {
    topicContainer.style.visibility = "visible";
    stps.style.visibility = "visible";
    selectOrder.style.visibility = "visible";
  }
  // heading
  if (topicChangeRequired) {
    stepsText.textContent = `${s.currTopic!}`;
    topicText.textContent = s.topics[s.currTopic!].title;
    topicText.id = `${s.currTopic!}`;
  }

  // subtopics (andomly shuffle before displaying)
  if (topicChangeRequired) {
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
  }

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
      },
      edges: {
        color: { color: "#000000" },
      },
      interaction: { hover: true
      }
    },
  );
};
