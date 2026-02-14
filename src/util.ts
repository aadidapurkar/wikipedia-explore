// Util functions
export const jsonParser = (res: Response) => res.json();
export const textParser = (res: Response) => res.text();
export const getUrlWikiTopicQueryApi = (topic: string) =>
  `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=${topic}&srlimit=1&srprop=snippet&origin=*`;

export const shuffleArray = <T>(arr: T[]): T[] => {
  const result = [...arr]; // copy
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const closeToast = () => {
  document.getElementById('toast')!.classList.add("hidden")
}

export const setVisibility = (elements: HTMLElement[], visibility: "visible" | "hidden") => {
  elements.forEach(el => el.style.visibility = visibility);
};