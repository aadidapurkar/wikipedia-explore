// IMPORTS
import {
  fromEvent,
  map,
  switchMap,
  Observable,
  of,
  catchError,
  filter,
} from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { getUrlWikiTopicQueryApi, jsonParser } from "./util";
import { type WikiSearchResponse, type Topic, type WikiLinksResponse, PREFS_ARR, type SubtopicPref } from "./types";
import { AddTopic, ChangeSubtopicLimit, ChangeSubtopicPref, CurrTopicIdxChange, RootTopic } from "./state";

// HTML elements
const inputTopic = document.getElementById("inputTopic")! as HTMLInputElement;
const topicText = document.getElementsByClassName("topicText")[0]!;
const btnExploreTopic = document.getElementById(
  "btnExploreTopic"
)! as HTMLButtonElement;
const btnBack = document.getElementById(
  "btnBack"
)! as HTMLButtonElement;
const btnFwd = document.getElementById(
  "btnForward"
)! as HTMLButtonElement;
const subtopicContainer = document.getElementById("subtopicContainer")!;
const selectOrder = document.getElementById("order")! as HTMLSelectElement
const inputLimit = document.getElementById("inputSubtopicLimit")! as HTMLInputElement

// Change amount of shown subtopics
export const changeSubtopicLimit$ = fromEvent<MouseEvent>(inputLimit, "input").pipe(
  map(_ => {
    const limit : number = parseInt(inputLimit.value)
    return limit > 0 ? new ChangeSubtopicLimit(limit) : new ChangeSubtopicLimit(100)
  }))

// Change subtopic ordering
export const changeSubtopicOrdering$ = fromEvent<MouseEvent>(selectOrder, "change").pipe(
  map(_ => {
    const pref : string = selectOrder.value
    return PREFS_ARR.includes(pref) ? new ChangeSubtopicPref(pref as SubtopicPref) : new ChangeSubtopicPref(PREFS_ARR[0] as SubtopicPref)
  })
)


// Go back a topic
export const decrementTopic$ = fromEvent<MouseEvent>(btnBack, "click").pipe(
  map(_ => new CurrTopicIdxChange(-1))
)

// Go forward a topic
export const incrementTopic$ = fromEvent<MouseEvent>(btnFwd, "click").pipe(
  map(_ => new CurrTopicIdxChange(1))
)

// For any subtree subtopic of root, explore the subtopic rightward
export const exploreSubtopic$ = fromEvent<MouseEvent>(subtopicContainer, "click").pipe(
  filter(
    (event) => (event.target as HTMLElement).tagName.toLowerCase() === "p"
  ),
  map((event: any) => event.target.textContent as string),
  map((subtopic: string) => [topicText.id, subtopic]),
  switchMap(([topicIdx, topicName]) =>
    getSubtopics$(topicName).pipe(
      map(
        (subtopics) =>
          [parseInt(topicIdx), {
            title: topicName,
            subtopics: subtopics,
          } as Topic] as [number, Topic]
      )
    )
  ),
  map( ([i, t]) => new AddTopic(t, i) )
);

// Initiate the root topic
export const newTopic$ = fromEvent(btnExploreTopic, "click").pipe(
  map((_) => inputTopic.value),
  switchMap((topic) =>
    getRequest$<WikiSearchResponse>(getUrlWikiTopicQueryApi(topic), jsonParser)
  ),
  map((res) => res.query.search[0].title),
  switchMap((title) =>
    getSubtopics$(title).pipe(
      map(
        (subtopics) =>
          ({
            title: title,
            subtopics: subtopics,
          } as Topic)
      )
    )
  ),
  map((topic: Topic) => new RootTopic(topic))
);

export const getSubtopics$ = (topic: string) =>
  getRequest$<WikiLinksResponse>(
    `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${topic}&prop=links&pllimit=max&origin=*`,
    jsonParser
  ).pipe(
    map((res) => {
      const pages = res.query.pages;
      const page = pages[Object.keys(pages)[0]];
      return page.links?.map((link: { title: any }) => link.title) ?? [];
    })
  );

export const getRequest$ = <T>(
  url: string,
  parser: (res: Response) => Promise<T>
): Observable<T> =>
  fromFetch(url).pipe(
    switchMap((response) => {
      if (response.ok) {
        return parser(response) as Promise<T>;
      } else {
        return of({ error: true, message: `Error ${response.status}` } as T);
      }
    }),
    catchError((err) => {
      console.error(err);
      return of({ error: true, message: err.message } as T);
    })
  );
