## 1. Install Tailwind

Init project
```javascript
npm init -y
```

Install Tailwind 1/2
```javascript
npm install -D tailwindcss@3.4.1
```

Install Tailwind 2/2
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
npm install -g typescript
```

Config TypeScript in `tsconfig.json`
```javascript
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true
  }
}
```

Write TypeScript code in `src/main.ts`
```javascript
const button = document.querySelector("button") as HTMLButtonElement;

button.addEventListener("click", () => {
    console.log("Bouton cliqué !");
});
```

Compil in JavaScript to generate `dist/main.js`
```javascript
tsc
```

Include in HTML
```javascript
<script src="dist/main.js"></script>
```


## (old) Install Tailwind

Install Tailwind
```javascript
npm install tailwindcss @tailwindcss/cli
```

Import Tailwind in `input.css`
```javascript
@import "tailwindcss";
```

Create `output.css`
```javascript
npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css --watch
```

Include in HTML
```javascript
<link href="./output.css" rel="stylesheet">
```