// IMPORTS -----------------------------------------------------------------------------
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
import { closeToast } from "./util";

// HTML elem -----------------------------------------------------------------------------
const inputTopic = document.getElementById("inputTopic")! as HTMLInputElement;
const topicText = document.getElementsByClassName("topicText")[0]!;
const btnExploreTopic = document.getElementById(
  "btnExploreTopic"
)! as HTMLButtonElement;
const toast = document.getElementById('toast')!;
const btnDL = document.getElementById("btnDownload")! as HTMLButtonElement;
const btnToastClose = document.querySelector(".toast-close")! as HTMLButtonElement;
const tooltipSwitch = document.getElementById("tooltipSwitch")! as HTMLInputElement
const btnShowSettings = document.getElementById("btnShowSettings")! as HTMLButtonElement;
const settingsModal =  document.getElementById("settingsModal")! as HTMLDivElement;
const btnCloseSettings = document.getElementById("btnCloseSettings")! as HTMLButtonElement;
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
// Note that the below code is causing side effects in the DOM
// However, the reason for this is because these side effects are designed independent of state updates
//state$.subscribe(console.log) // (DEBUG) Log state 

// Clear topic input after submitting for UX/UI purposes
merge(exploreTopic$, enterPress$).subscribe((_) => {
inputTopic.value = ""
})

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

const showSettingsModal = (status: string) => status == "visible" ? settingsModal.classList.remove("hidden") :  settingsModal.classList.add("hidden")
// Settings modal listener
fromEvent(btnShowSettings, "click").subscribe(() => showSettingsModal("visible"));
fromEvent(btnCloseSettings, "click").subscribe(() => showSettingsModal("n"));
// Download button event listener
fromEvent(btnDL, "click").subscribe(downloadGraph);


// local storage for checking first time page load for tooltip showing
if (typeof(Storage) !== "undefined") {
  // Get visited before status
  const visitedBefore = localStorage.getItem("visitedBefore")
  toast.classList.add("hidden");
  if (visitedBefore !== null) {
    // User has visited before, hide tooltips this session
    document.body.classList.add("no-tooltips");
  } else {
    // User has not visited before, add to local storage but don't hide tooltips this session
    localStorage.setItem("visitedBefore", "true")
    console.log("No previous visit detected! Tooltips will be shown.");
    tooltipSwitch.checked = !document.body.classList.contains("no-tooltips");
    toast.classList.remove("hidden");
    setTimeout(closeToast, 15000)
  }

} else {
  console.log("DEBUG No web browser local storage support ")
}

// Close toast on click
fromEvent(btnToastClose, "click").subscribe(() => closeToast());

fromEvent(tooltipSwitch, "change").subscribe((e) => {
  const isChecked = (e.target as HTMLInputElement).checked;
  if (isChecked) {
    // Switch ON -> Show Tooltips
    document.body.classList.remove("no-tooltips");
    console.log("Tooltips enabled");
  } else {
    // Switch OFF -> Hide Tooltips
    document.body.classList.add("no-tooltips");
    console.log("Tooltips disabled");
  }
});