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



