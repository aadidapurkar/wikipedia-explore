# [Website](https://aadidapurkar.github.io/wikipedia-explore/) for Lazily Explored Wikipedia Topics
Wikipedia exploration, starting at some root topic 

### Prerequisites
- Install [Node.js](https://nodejs.org/en/download)
- Run `npm install`

### Dependencies
- Code relies on Wikipedia API endpoints
- Will stop working if API/response structure change

### Run
- To update changes live
    - `npm run dev`
- To compile into Vanilla HTML/CSS/JS
    - Check prop `base` in in `vite.config.ts` is `./`
    - Run `npm run build`
    - Run `npx serve dist`
- Update gh-pages branch for deployment
    - Check prop `base` in in `vite.config.ts` is `/wikipedia-explore` / the name of the repo
    - Run `npm run deploy`


### Notes
- No backend server middleman
- All requests are done in the browser through Wikipedia API
    - This is fine for now as most public API's and Wikipedia's API allow CORS

### Inspect code
- in the root directory
    - `index.html`
- in the src directory
    - typescript
        - `main.ts` - master MVC logic
        - `observable.ts` - user input / web request streams
        - `types.ts`
        - `state.ts` - define actions which define reductions from oldState -> newState 
        - `util.ts` -
        - `render.ts` - define how a state should look in the view

    - css
        - `style.css`



