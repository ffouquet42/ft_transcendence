## 1. Install Tailwind

Init project
```javascript
npm init -y
```

Install Tailwind [1/2]
```javascript
npm install -D tailwindcss@3.4.1
```

Install Tailwind [2/2]
```javascript
npx tailwindcss init
```

Import Tailwind in `./srcs/input.css`
```javascript
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Add paths of html files in `tailwind.config.js`
```javascript
module.exports = {
  content: ["./src/index.html"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

Create / Update `output.css` (Keep running while working)
```javascript
npx tailwindcss -i ./src/input.css -o ./src/output.css --watch
```

Include in HTML
```javascript
<link href="./output.css" rel="stylesheet">
```


## 2. Install TypeScript

Install TypeScript
```javascript
npm install typescript --save-dev
```

Config TypeScript in `tsconfig.json`
```javascript
{
	"compilerOptions": {
	  "target": "ES6",
	  "module": "ES6",
	  "rootDir": "src",
	  "outDir": "dist",
	  "strict": true
	},
	"include": ["src/**/*"]
  }
```

Write TypeScript code in `src/main.ts` (example) :
```javascript
const button = document.querySelector("button") as HTMLButtonElement;

button.addEventListener("click", () => {
    console.log("Hello World!");
});
```

Create / Update `dist/main.js` (Keep running while working)
```javascript
npx tsc --watch
```

Include in HTML before `</body>`
```javascript
<script type="module" src="../dist/main.js" defer></script>
```


## 3. Install Local Server

Install TypeScript
```javascript
npm install -g serve
```


## 4. Working Flow

Open 3 Terminals :

Terminal #1 :
```javascript
npx tailwindcss -i ./src/input.css -o ./src/output.css --watch
```

Terminal #2 :
```javascript
npx tsc --watch
```

Terminal #3 :
```javascript
serve .
```