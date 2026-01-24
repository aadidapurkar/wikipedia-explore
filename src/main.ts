// IMPORTS -----------------------------------------------------------------------------
import { fromFetch } from "rxjs/fetch";
import "./style.css";
import {
  catchError,
  from,
  fromEvent,
  fromEventPattern,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  scan,
  switchMap,
} from "rxjs";
import { decrementTopic$, incrementTopic$, newTopic$, exploreSubtopic$, changeSubtopicOrdering$, changeSubtopicLimit$ } from "./observable";
import { initialState } from "./state";
import type { Action, State, Topic } from "./types";
import { render } from "./render";

// HTML elem -----------------------------------------------------------------------------
const inputTopic = document.getElementById("inputTopic")! as HTMLInputElement;
const topicText = document.getElementsByClassName("topicText")[0]!;
const btnExploreTopic = document.getElementById(
  "btnExploreTopic"
)! as HTMLButtonElement;

// MVC -----------------------------------------------------------------------------
// (CONTROLLER) Merged stream of controller observables, mapped to Actions
const action$ = merge(newTopic$, exploreSubtopic$, decrementTopic$, incrementTopic$, changeSubtopicOrdering$, changeSubtopicLimit$)

// (MODEL) Reduced stream of State 
const state$ = action$.pipe(
  scan((accState : State , action: Action) => action.apply(accState), initialState)
)

// (VIEW Update view every time state changes
state$.subscribe((s) => render(s))


// MISC ----------------------------------------------------------------------


// Clear topic input after submitting for UX/UI purposes
fromEvent(btnExploreTopic, "click").subscribe((_) => {
  inputTopic.value = ""
})

// (DEBUG) Log state 
//state$.subscribe(console.log)

const downloadGraph = () => {
  const container = document.getElementById("explorationGraph");
  const canvas = container?.getElementsByTagName("canvas")[0] as HTMLCanvasElement;

  if (canvas) {
    const imageURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imageURL;
    link.download = "wiki-exploration-graph.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    console.error("Canvas not found.");
  }
};

document.getElementById("btnDownload")?.addEventListener("click", downloadGraph);


