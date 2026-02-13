// IMPORTS -----------------------------------------------------------------------------
import { fromFetch } from "rxjs/fetch";
import "./style.css";
import {
  catchError,
  filter,
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
import { decrementTopic$, incrementTopic$, newTopic$, exploreSubtopic$, changeSubtopicOrdering$, changeSubtopicLimit$, enterPress$, exploreTopic$ } from "./observable";
import { initialState } from "./state";
import type { Action, State, Topic } from "./types";
import { render } from "./render";

// HTML elem -----------------------------------------------------------------------------
const inputTopic = document.getElementById("inputTopic")! as HTMLInputElement;
const topicText = document.getElementsByClassName("topicText")[0]!;
const btnExploreTopic = document.getElementById(
  "btnExploreTopic"
)! as HTMLButtonElement;
const btnDL = document.getElementById("btnDownload")! as HTMLButtonElement;
// MVC -----------------------------------------------------------------------------
// (CONTROLLER) Merged stream of controller observables, mapped to Actions
const action$ = merge(newTopic$, exploreSubtopic$, decrementTopic$, incrementTopic$, changeSubtopicOrdering$, changeSubtopicLimit$)

// (MODEL) Reduced stream of State 
const state$ = action$.pipe(
  scan((accState : State , action: Action) => action.apply(accState), initialState)
)

// (VIEW) Update view every time state changes
state$.subscribe((s) => render(s))


// MISC ----------------------------------------------------------------------

// Clear topic input after submitting for UX/UI purposes
merge(exploreTopic$, enterPress$).subscribe((_) => {
inputTopic.value = ""
})

//state$.subscribe(console.log) // (DEBUG) Log state 

// Download graph as PNG
const downloadGraph = () => {
  // input canvas
  const container = document.getElementById("explorationGraph");
  const canvases = container?.getElementsByTagName("canvas");
  const canvas = canvases?.[canvases.length - 1]; // only one canvas should be present

  // export canvas
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = canvas!.width;
  exportCanvas.height = canvas!.height;

  const ctx = exportCanvas.getContext("2d")!; 
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  ctx.drawImage(canvas!, 0, 0);

  // download image
  const imageURL = exportCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = imageURL;
  link.download = "wiki-exploration-graph.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Download button event listener
fromEvent(btnDL, "click").subscribe(downloadGraph);


