import ApiService from '../services/api.service';
import { navigateTo } from '../app';

function clearSessionStorage() {
	localStorage.removeItem('token');
	localStorage.removeItem('user');
	localStorage.removeItem('gameSettings');
}
function clearPending2FA() {
  sessionStorage.removeItem('pendingUser');
}

	function logoutAndRedirect() {
  clearSessionStorage();
  navigateTo('/login');
}

class LoginView extends HTMLElement {
  	private signInForm = { username: '', password: '' };
  	private signInError = '';
  	private isLoading = false;
  	private show2FAForm = false;
  	private code2FA = '';
  	private isAuthenticated = false;

  	constructor() {
		super();
  	}

  	connectedCallback() {
		this.checkAuth();
		 window.addEventListener('popstate', this.cancel2FAIfNeeded);
	document.addEventListener('click', this.cancel2FAIfNeededByLink);
  	}


  disconnectedCallback() {
	window.removeEventListener('popstate', this.cancel2FAIfNeeded);
	document.removeEventListener('click', this.cancel2FAIfNeededByLink);
  }



 cancel2FAIfNeeded = () => {
	if (window.location.pathname !== '/login' && window.location.pathname !== '/2fa') {
	  clearPending2FA();
	  this.show2FAForm = false;
	  this.code2FA = '';
	}
  }

  cancel2FAIfNeededByLink = (e: any) => {
	const target = e.target as HTMLElement;
	if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('/')) {
	  const href = target.getAttribute('href');
	  if (href !== '/login' && href !== '/2fa') {
		clearPending2FA();
		this.show2FAForm = false;
		this.code2FA = '';
	  }
	}
  }

  	async checkAuth() {
		const token = localStorage.getItem('token');

		if (!token) {
	  		clearSessionStorage();
	  		this.isAuthenticated = false;
	  		this.render();
	  		return;
		}

   		try {
	  		await ApiService.getProfile();
	  		this.isAuthenticated = true;
		} catch {
	  	clearSessionStorage();
	  	this.isAuthenticated = false;
		}

		this.render();
  	}

	

  	handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.name === 'username') this.signInForm.username = target.value;
		if (target.name === 'password') this.signInForm.password = target.value;
		if (target.name === 'code2FA') this.code2FA = target.value;
  	}





	async handleSignIn(e: Event) {
  		e.preventDefault();
  		this.signInError = '';
  		this.isLoading = true;
  		this.render();

  		try {
			const response = await ApiService.login(this.signInForm.username, this.signInForm.password);
			
			if (response.twofa) {
				this.show2FAForm = true;
				this.render();
				return;
			}
			
			localStorage.setItem('token', response.token);
			const profile = await ApiService.getProfile();
			localStorage.setItem('user', JSON.stringify(profile));
			navigateTo('/profile');
		} catch (error: any) {
  if (
	error?.response?.status === 401 ||
	error?.message === 'Invalid token' ||
	error?.message === 'Authorization header missing'
  ) {
	logoutAndRedirect();
	return;
  }
  this.signInError = error.message || 'Login failed';
  this.render();
}
 finally {
				this.isLoading = false;
				this.render();
  		}
	}

async handle2FASubmit(e: Event) {
  e.preventDefault();
  try {
	const result = await ApiService.verify2FA(this.code2FA);

	localStorage.setItem('token', result.token);
	localStorage.setItem('user', JSON.stringify(result.user));

	navigateTo('/profile');

  } catch (err: any) {
	this.signInError = err.message || '2FA failed';
	this.render();
  }
}

  	render() {
		this.innerHTML = '';

		if (this.isAuthenticated) {
	  		this.innerHTML = `
				<div class="text-center text-xl text-white mt-20">You are already logged in!</div>
	  		`;
	  		return;
		}

		const main = document.createElement('main');
		main.className = 'flex justify-center items-center min-h-[60vh] p-6';

		const wrapper = document.createElement('div');
		wrapper.className = 'p-[2px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg w-full max-w-md';

		const form = document.createElement('form');
		form.className = 'bg-gray-800 rounded-2xl p-8 w-full';
		form.onsubmit = this.show2FAForm ? this.handle2FASubmit.bind(this) : this.handleSignIn.bind(this);

		if (this.show2FAForm) {
	  		form.innerHTML = `
				<h2 class="text-2xl font-semibold mb-6 text-center">Enter 2FA Code</h2>
				<input type="text" name="code2FA" class="w-full px-4 py-2 mb-6 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="2FA Code" required />
				<button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-full transition">Verify</button>
				${this.signInError ? `<div class="text-red-500 mt-4 text-center">${this.signInError}</div>` : ''}
	  		`;
		} else {
	  		form.innerHTML = `
				<h2 class="text-4xl font-semibold mb-6 text-center">Sign In</h2>
				<div class="p-[2px] mb-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
		  			<input type="text" name="username" class="w-full px-4 py-2 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-0" placeholder="Username" required value="${this.signInForm.username}" />
				</div>
				<div class="p-[2px] mb-6 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
		  			<input type="password" name="password" class="w-full px-4 py-2 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-0" placeholder="Password" required value="${this.signInForm.password}" />
				</div>
				<button type="submit" class="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white rounded-full transition" ${this.isLoading ? 'disabled' : ''}>
		  			${this.isLoading ? 'Signing in...' : 'Log In'}
				</button>
				${this.signInError ? `<div class="text-red-500 mt-4 text-center">${this.signInError}</div>` : ''}
	  		`;
		}

		form.querySelectorAll('input').forEach(input =>
	  		input.addEventListener('input', this.handleInput.bind(this))
		);

		wrapper.appendChild(form);
   	 	main.appendChild(wrapper);
		this.appendChild(main);
  	}
}

customElements.define('login-view', LoginView);