## TypeScript

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


## Tailwind

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