"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("toggleSignIn");
    if (btn) {
        btn.addEventListener("click", () => {
            alert("Sign in button clicked!");
        });
    }
    else {
        console.error("Bouton non trouvé !");
    }
});
