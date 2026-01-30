import type { Network, Node, Edge, Options } from 'vis-network';

// All observables will map to an object of a class which have an apply method, mapping a reduced state to a new state
export interface Action {
  apply(s: State): State;
}

// State types
export const PREFS_ARR = ["random", "default"]
export type SubtopicPref = "random" | "default"

export type Topic = {
  title: string,
  subtopics: string[]
}
export type State = {
  currTopic?: number;
  topics : Topic[]
  pref: SubtopicPref
  limit: number
  graph: { nodes: Node[]  ; edges: Edge[] }
}

// Web request types (Wikipedia API)
// todo - better parsing and error handling
export type WikiSearchResponse = {
  batchcomplete: string;
  continue: {
    sroffset: number;
    continue: string;
  };
  query: {
    searchinfo: {
      totalhits: number;
    };
    search: {
      ns: number;
      title: string;
      pageid: number;
      snippet: string;
    }[];
  };
};

// todo - better parsing and error handling
export type WikiLinksResponse = {
  query: {
    pages: {
      [pageid: string]: {
        pageid: number;
        title: string;
        links?: { ns: number; title: string }[];
      };
    };
  };
};