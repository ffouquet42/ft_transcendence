document.addEventListener("DOMContentLoaded", () => {
	const toggleBtnIn = document.getElementById("toggleSignIn");
	const formIn = document.getElementById("signin-form") as HTMLElement | null;
	const closeBtnIn = document.getElementById("closeSignInForm");
  
	const toggleBtnUp = document.getElementById("toggleSignUp");
	const formUp = document.getElementById("signup-form") as HTMLElement | null;
	const closeBtnUp = document.getElementById("closeSignUpForm");
  
	const toggleForm = (form: HTMLElement) => {
	  form.classList.toggle("max-h-0");
	  form.classList.toggle("opacity-0");
	  form.classList.toggle("max-h-[1000px]");
	  form.classList.toggle("opacity-100");
	};
  
	const closeForm = (form: HTMLElement) => {
	  form.classList.add("max-h-0", "opacity-0");
	  form.classList.remove("max-h-[1000px]", "opacity-100");
	};
  
	if (toggleBtnIn && formIn) {
	  toggleBtnIn.addEventListener("click", () => toggleForm(formIn));
	}
  
	if (closeBtnIn && formIn) {
	  closeBtnIn.addEventListener("click", () => closeForm(formIn));
	}
  
	if (toggleBtnUp && formUp) {
	  toggleBtnUp.addEventListener("click", () => toggleForm(formUp));
	}
  
	if (closeBtnUp && formUp) {
	  closeBtnUp.addEventListener("click", () => closeForm(formUp));
	}
  });
  