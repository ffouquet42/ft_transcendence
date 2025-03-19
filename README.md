Étape 1 : Installer TypeScript

npm install -g typescript

Étape 2 : Configurer TypeScript => "tsconfig.json"

{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true
  }
}

Étape 3 : Écrire ton code TypeScript => "src/main.ts"

const button = document.querySelector("button") as HTMLButtonElement;

button.addEventListener("click", () => {
    console.log("Bouton cliqué !");
});

Étape 4 : Compiler en JavaScript

tsc

Cela génère un fichier dist/main.js que tu peux inclure dans ton HTML :

<script src="dist/main.js"></script>

---

tailwind.css

1. Terminal => npm install tailwindcss @tailwindcss/cli
2. input.css => @import "tailwindcss";
3. Terminal => npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css --watch
4. index.html => <link href="./output.css" rel="stylesheet">

---

- Single page application ?