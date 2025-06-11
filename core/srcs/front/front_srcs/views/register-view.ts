import ApiService from '../services/api.service';

class RegisterView extends HTMLElement {
	private signUpForm = { username: '', password: '', confirmPassword: '' };
  	private signUpError = '';
  	private signUpSuccess = '';
  	private isLoading = false;

  	constructor() {
		super();
  	}

  	connectedCallback() {
		this.render();
  	}

validatePassword(password: string): string[] {
  const errors = [];
  if (password.length < 8)
	errors.push('Password must be at least 8 characters long');
  if (!/[a-z]/.test(password))
	errors.push('Password must contain at least one lowercase letter');
  if (!/[A-Z]/.test(password))
	errors.push('Password must contain at least one uppercase letter');
  if (!/\d/.test(password))
	errors.push('Password must contain at least one number');
  if (!/[!@.]/.test(password))
	errors.push('Password must contain at least one special character: ! @ .');
  if (/[^a-zA-Z0-9!@.]/.test(password))
	errors.push('Password can only contain letters, numbers, and the special characters: ! @ .');
  return errors;
}


  	handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.name === 'username') this.signUpForm.username = target.value;
		if (target.name === 'password') this.signUpForm.password = target.value;
		if (target.name === 'confirmPassword') this.signUpForm.confirmPassword = target.value;
  	}

  	async handleSignUp(e: Event) {
		 e.preventDefault();
  this.signUpError = '';
  this.signUpSuccess = '';
  this.isLoading = true;
  this.render();
		try {
	  		const { username, password, confirmPassword } = this.signUpForm;

	  		if (!username || !password || !confirmPassword)
				throw new Error('Please fill in all fields');

	  		if (password !== confirmPassword)
				throw new Error('Passwords do not match');

	  		const passwordErrors = this.validatePassword(password);

	  		if (passwordErrors.length > 0)
				throw new Error(passwordErrors.join(', '));

	  		await ApiService.register(username, password);
	this.signUpSuccess = 'Account successfully created! You can now log in.';
	this.signUpForm.password = '';
	this.signUpForm.confirmPassword = '';
  } catch (error: any) {
	this.signUpError = error.message || 'Registration failed';
	this.signUpForm.password = '';
	this.signUpForm.confirmPassword = '';
  } finally {
	this.isLoading = false;
	this.render();
  }
}

  	render() {
		this.innerHTML = '';

		const main = document.createElement('main');
		main.className = 'flex justify-center items-center min-h-[60vh] p-6';

		const wrapper = document.createElement('div');
		wrapper.className = 'p-[2px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg w-full max-w-md';

		const form = document.createElement('form');
		form.className = 'bg-gray-800 rounded-2xl p-8 w-full';
		form.onsubmit = this.handleSignUp.bind(this);

		form.innerHTML = `
	  		<h2 class="text-4xl font-semibold mb-6 text-center">Sign Up</h2>

	  		<!-- Username -->
	  		<div class="p-[2px] mb-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
				<input type="text" name="username" placeholder="Username" class="w-full px-4 py-2 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-0" required value="${this.signUpForm.username}" />
	  		</div>

	  		<!-- Password -->
	  		<div class="p-[2px] mb-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
				<input type="password" name="password" placeholder="Password" class="w-full px-4 py-2 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-0" required value="${this.signUpForm.password}" />
	  		</div>

	  		<!-- Confirm Password -->
	  		<div class="p-[2px] mb-6 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
				<input type="password" name="confirmPassword" placeholder="Confirm Password" class="w-full px-4 py-2 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-0" required value="${this.signUpForm.confirmPassword}" />
	  		</div>

	  		<button type="submit" class="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white rounded-full transition"
				${this.isLoading ? 'disabled' : ''}>
				${this.isLoading ? 'Registering...' : 'Register'}
	  		</button>

	  		${this.signUpSuccess ? `<div class="text-green-400 text-sm mt-4 text-center">${this.signUpSuccess}</div>` : ''}
	  		${this.signUpError ? `<div class="text-red-500 text-sm mt-4 text-center">${this.signUpError}</div>` : ''}
   	 	`;

		form.querySelectorAll('input').forEach(input =>
	  		input.addEventListener('input', this.handleInput.bind(this))
		);

		wrapper.appendChild(form);
		main.appendChild(wrapper);
		this.appendChild(main);
  	}
}

customElements.define('register-view', RegisterView);