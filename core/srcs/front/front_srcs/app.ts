
import './styles.css';
import './views/home-view.ts';
import './views/game-view.ts';
import './views/gamelog-view.ts';
import './views/game-remote-view.ts';
import './views/tournament-view.ts';
import './views/chat-view.ts';
import './views/friend-profile-view.ts';
import './views/friend-view.ts';
import './views/settings-view.ts';
import './views/profile-view.ts';
import './views/login-view.ts';
import './views/register-view.ts';
import './views/navbar-view.ts';
import './views/footer-view.ts';
import { WebSocketService } from './services/websocket-service';
import { API_BASE_URL } from './config';

const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
const wsUrl = `${wsProtocol}${API_BASE_URL.substring(API_BASE_URL.indexOf('://'))}/ws`;
const wsService = new WebSocketService(wsUrl);
export default wsService;


type Route = {
	path: string;
	component: string;
	protected?: boolean;
};


const routes: Route[] = [
	{ path: '/', component: 'home-view' },
	{ path: '/game', component: 'game-view' },
	{ path: '/gamelog', component: 'gamelog-view', protected: true },
	{ path: '/game-remote', component: 'game-remote-view' },
	{ path: '/register', component: 'register-view' },
	{ path: '/login', component: 'login-view' },
	{ path: '/tournament', component: 'tournament-view', protected: true },
	{ path: '/chat', component: 'chat-view', protected: true },
	{ path: '/friend-profile', component: 'friend-profile-view', protected: true },
	{ path: '/friends', component: 'friend-view', protected: true },
	{ path: '/settings', component: 'settings-view', protected: true },
	{ path: '/profile', component: 'profile-view', protected: true },
];

function navigateTo(path: string) {
	if (window.location.pathname !== path) {
		history.pushState({}, '', path);
		renderRoute();
	}
}


function renderRoute() {
	const main = document.querySelector('main');
	if (!main) return;

	const route = routes.find(r => r.path === window.location.pathname);
	const token = localStorage.getItem('token');

	if (!route) {
		navigateTo('/');
		return;
	}

	if (route.protected && !token) {
		navigateTo('/login');
		return;
	}

	main.innerHTML = `<${route.component}></${route.component}>`;

	window.scrollTo(0, 0);

	const navbar = document.querySelector('navbar-view') as any;
	if (navbar?.update) navbar.update();
}

window.addEventListener('popstate', renderRoute);

document.addEventListener('click', (e) => {
	const target = e.target as HTMLElement;
	if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('/')) {
		e.preventDefault();
		navigateTo(target.getAttribute('href')!);
	}
});



class PongApp extends HTMLElement {
	connectedCallback() {
		document.body.className = 'bg-slate-900 text-white';
		this.innerHTML = `
		<main></main>
		<p hidden>pong-app loaded</p>`;
		renderRoute();
	}

	logout() {
		localStorage.removeItem('token');
		navigateTo('/');
	}
}

customElements.define('pong-app', PongApp);

export { navigateTo };