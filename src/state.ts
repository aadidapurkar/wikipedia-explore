import type { ElementDefinition } from "cytoscape";
import type { Action, State, SubtopicPref, Topic } from "./types";

// Initial state: no current topic, and no known topics
export const initialState: State = {
  topics: [],
  pref: "default",
  limit: 500,
  graph: {
    container: document.getElementById("explorationGraph"),
    elements: [],
    style: [
      // the stylesheet for the graph
      {
        selector: "node",
        style: {
          shape: "rectangle",
          "background-color": "#333", // Darker background for better contrast
          label: "data(label)",
          "text-valign": "center",
          "text-halign": "center",
          color: "#ffffff",
          "font-size": "14px", // Use px for consistency in Canvas
          "font-family": "sans-serif", // Match your UI font
          width: "label",
          height: "label",
          padding: "15px", // More breathing room makes it readable
          "text-wrap": "wrap", // Essential for long titles like "Ottoman jihad proclamation"
          "text-max-width": "150px", // Prevents nodes from being miles long
          "border-width": 1,
          "border-color": "#000",
        },
      },
      {
        selector: "edge",
        style: {
          width: 2, // Slightly thinner for a cleaner look
          "line-color": "#ccc",
          "curve-style": "haystack", // 'haystack' is faster and better for undirected trees than 'bezier'
          "target-arrow-shape": "none", // Removes the arrow head
          "source-arrow-shape": "none", // Ensures no arrow at the start
        },
      },
    ],
    layout: {
      name: "breadthfirst",
      padding: 50, // More space around the entire graph
      spacingFactor: 1.2, // Lowered this (1.75 was likely pushing nodes too far apart)
      animate: true,
      maximal: true, // Helps with tree-like structures to prevent overlap
    },
  },
};

export class ChangeSubtopicLimit implements Action {
  constructor(public readonly limit: number) {}
  apply(s: State): State {
    return {
      ...s,
      limit: this.limit,
    };
  }
}

export class ChangeSubtopicPref implements Action {
  constructor(public readonly pref: SubtopicPref) {}
  apply(s: State): State {
    return {
      ...s,
      pref: this.pref,
    };
  }
}

// Set current topic index to 0, and set known topics to just the root
export class RootTopic implements Action {
  constructor(public readonly rootTopic: Topic) {}
  apply(s: State): State {
    return {
      ...s,
      currTopic: 0,
      topics: [this.rootTopic],
      graph: {
        ...s.graph,
        elements: [
          { data: { id: this.rootTopic.title, label: this.rootTopic.title } },
        ],
      },
    };
  }
}

// Remove topics to the right, preverse topics to the left
export class AddTopic implements Action {
  constructor(
    public readonly newTopic: Topic,
    public readonly currTopicIndex: number,
  ) {}
  apply(s: State): State {
    const parentTopic = s.topics[this.currTopicIndex];
    // Create new node and edge
    const newNode = {
      data: { id: this.newTopic.title, label: this.newTopic.title },
    };
    const newEdge = {
      data: {
        id: `${parentTopic.title}-${this.newTopic.title}`,
        source: parentTopic.title,
        target: this.newTopic.title,
      },
    };

    return {
      ...s,
      currTopic: this.currTopicIndex + 1,
      topics: s.topics.slice(0, this.currTopicIndex + 1).concat(this.newTopic),
      graph: {
        ...s.graph,
        elements: ((s.graph.elements as ElementDefinition[]) ?? []).concat([
          newNode,
          newEdge,
        ]),
      },
    };
  }
}
// Change the current topic index by a certain amount if its valid with respect to topics of State and whether currTopic is defined
export class CurrTopicIdxChange implements Action {
  constructor(public readonly changeAmount: number) {}
  apply(s: State): State {
    if (s.currTopic === undefined) {
      return s;
    }
    const changeValid =
      s.currTopic + this.changeAmount >= 0 &&
      s.currTopic + this.changeAmount <= s.topics.length - 1;
    const newCurrTopic = changeValid
      ? s.currTopic + this.changeAmount
      : s.currTopic;
    return {
      ...s,
      currTopic: newCurrTopic,
    };
  }
}
