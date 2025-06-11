import ApiService from '../services/api.service';
import { API_BASE_URL } from '../config';
import { navigateTo } from '@/app';

class ProfileView extends HTMLElement {
	private user = { username: '', avatar: '' };
	private avatarUrl: string = '';
	private successMessage: string = '';
	private errorMessage: string = '';
	private wins: number = 0;
	private losses: number = 0;
	private showAllHistory = false;


	private matchHistory: Array<{
		match_id: number;
		user_id: number;
		opponent: string;
		result: 'win' | 'loss';
		score_user: number;
		score_opponent: number;
		played_at: string;
	}> = [];

	constructor() {
		super();
	}

	private onGameFinished = () => {
		ApiService.getProfile()
			.then(data => {
				this.wins = data.wins;
				this.losses = data.losses;
				this.loadMatchHistory().then(() => this.render());
			})
			.catch(err => console.error('Failed to reload profile after game finish:', err));
	};

	connectedCallback() {
		const token = localStorage.getItem('token');
		if (!token) return;

		ApiService.getProfile()
			.then(data => {
				this.user = {
					username: data.username,
					avatar: data.avatar
				};
				this.avatarUrl = data.avatar
					? (data.avatar.startsWith('/') ? `${API_BASE_URL}${data.avatar}` : data.avatar)
					: `${API_BASE_URL}/avatars/default.png`;
				this.wins = data.wins;
				this.losses = data.losses;

				this.render();
				this.loadMatchHistory().then(() => this.render());
			})
			.catch(err => {
				console.error('Failed to load profile:', err);
			});

		window.addEventListener('game:finished', this.onGameFinished);
	}

	disconnectedCallback() {
		window.removeEventListener('game:finished', this.onGameFinished);
	}

	private showMessage(type: 'success' | 'error', message: string) {
		if (type === 'success') {
			this.successMessage = message;
			this.errorMessage = '';
		} else {
			this.errorMessage = message;
			this.successMessage = '';
		}
		setTimeout(() => {
			this.successMessage = '';
			this.errorMessage = '';
			this.render();
		}, 3000);
	}

	private async handleAvatarUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		try {
			const avatarPath = await ApiService.uploadAvatar(file);
			this.user.avatar = avatarPath;

			const newUrl = avatarPath.startsWith('/')
				? `${API_BASE_URL}${avatarPath}?t=${Date.now()}`
				: `${avatarPath}?t=${Date.now()}`;
			this.avatarUrl = newUrl;

			const imgEl = this.querySelector<HTMLImageElement>('img[user-avatar]');
			if (imgEl) {
				imgEl.src = this.avatarUrl;
			}

			this.showMessage('success', 'Avatar updated!');
		} catch (err) {
			this.showMessage('error', 'Failed to upload avatar');
		}
	}

	private logout() {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		navigateTo('/');
	}

	private async loadMatchHistory() {
		try {
			const data = await ApiService.getMatchHistory();
			this.matchHistory = data;
			this.matchHistory.forEach(m => {
				console.log('[MATCH]', {
				match_id: m.match_id,
				user_id: m.user_id,
				opponent: m.opponent,
				result: m.result,
				score_user: m.score_user,
				score_opponent: m.score_opponent,
				played_at: m.played_at
			});
		});
		} catch (err) {
			console.error('Error loading match history:', err);
		}
	}

	

	render() {
		const formatDate = (iso: string) => {
			const d = new Date(iso);
			return d.toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		};
const matchesSorted = this.matchHistory
	.sort((a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime());

const matchesToShow = this.showAllHistory ? matchesSorted : matchesSorted.slice(0, 10);

const historyRows = matchesToShow
	.map(m => {
		const scoreText = `${m.score_user} – ${m.score_opponent}`;
		const resultColor = m.result === 'win' ? 'text-green-400' : 'text-red-400';
		return `
			<tr class="border-b border-gray-700 hover:bg-gray-800">
				<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-200">
					${formatDate(m.played_at)}
				</td>
				<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-200">${m.opponent}</td>
				<td class="px-4 py-2 whitespace-nowrap text-sm font-semibold ${resultColor}">
					${m.result.toUpperCase()}
				</td>
				<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-200">${scoreText}</td>
			</tr>
		`;
	})
	.join('');

		this.innerHTML = `
			<div class="bg-gray-900 py-12">
				<div class="mx-auto max-w-4xl px-6 lg:px-8">
					<div class="relative rounded-3xl p-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg overflow-hidden">
						<div class="rounded-[22px] bg-gray-800 p-6 flex flex-col items-center space-y-4">
							<h2 class="text-4xl font-bold text-white">${this.user.username}</h2>
							<div class="w-24 h-24 rounded-full p-[2px] bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
								<div class="w-full h-full rounded-full bg-gray-900">
									<img user-avatar src="${this.avatarUrl}" alt="User Avatar" class="w-full h-full rounded-full object-cover" />
								</div>
							</div>
							<p class="text-sm text-gray-300">Change your avatar</p>
							<label class="px-3 py-1 bg-gradient-to-r from-white via-pink-100 to-purple-200 text-slate-900 hover:opacity-90 rounded-full transition cursor-pointer">
								Choose File
								<input type="file" accept="image/*" class="hidden" />
							</label>
							<button id="logout-button" class="px-3 py-1 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white rounded-full transition hover:opacity-90">
								Logout
							</button>
							${this.successMessage ? `<div class="text-green-500 font-bold">${this.successMessage}</div>` : ''}
							${this.errorMessage ? `<div class="text-red-500 font-bold">${this.errorMessage}</div>` : ''}
						</div>
					</div>
				</div>
			</div>

			<div class="bg-gray-900 pb-24">
				<div class="mx-auto max-w-7xl px-6 lg:px-8">
					<div class="text-center space-y-4">
						<h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Your Game Statistics</h2>
						<p class="text-lg leading-8 text-gray-300">Review your multiplayer performance below. Stay sharp and keep improving!</p>
					</div>

					<h3 class="mt-16 mb-4 text-center text-xl font-semibold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Total Game Statistics</h3>

					<dl class="mt-6 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
						<div class="flex flex-col bg-white/5 p-8">
							<dt class="text-sm font-semibold text-gray-300">Played</dt>
							<dd class="order-first text-3xl font-semibold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">${this.wins + this.losses}</dd>
						</div>
						<div class="flex flex-col bg-white/5 p-8">
							<dt class="text-sm font-semibold text-gray-300">Wins</dt>
							<dd class="order-first text-3xl font-semibold text-green-500">${this.wins}</dd>
						</div>
						<div class="flex flex-col bg-white/5 p-8">
							<dt class="text-sm font-semibold text-gray-300">Losses</dt>
							<dd class="order-first text-3xl font-semibold text-red-500">${this.losses}</dd>
						</div>
						<div class="flex flex-col bg-white/5 p-8">
							<dt class="text-sm font-semibold text-gray-300">Win Rate</dt>
							<dd class="order-first text-3xl font-semibold text-green-500">${(this.wins + this.losses > 0 ? ((this.wins / (this.wins + this.losses)) * 100).toFixed(1) : '0')}%</dd>
						</div>
					</dl>
				</div>
			</div>

			<div class="mx-auto max-w-7xl px-6 lg:px-8 my-12">
				<h3 class="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Match History (Tournaments)</h3>
				<div class="overflow-x-auto">
					<table class="min-w-full table-auto divide-y divide-gray-700">
						<thead class="bg-gray-800">
							<tr>
								<th class="px-4 py-2 text-left text-sm font-medium text-gray-300">Date</th>
								<th class="px-4 py-2 text-left text-sm font-medium text-gray-300">Opponent</th>
								<th class="px-4 py-2 text-left text-sm font-medium text-gray-300">Result</th>
								<th class="px-4 py-2 text-left text-sm font-medium text-gray-300">Score</th>
							</tr>
						</thead>
						<tbody class="bg-gray-900 divide-y divide-gray-700">
							${historyRows ||
								`<tr>
									<td colspan="4" class="px-4 py-3 text-center text-gray-500">No matches found.</td>
								</tr>`}
						</tbody>
					</table>
				</div>
				${this.matchHistory.length > 10 ? `
	<div class="text-center mt-2">
		<button class="text-sm text-blue-400 underline" id="toggle-history-btn">
			${this.showAllHistory ? 'Voir moins' : 'Voir tout'}
		</button>
			</div>
` : ''}
		`;

		const fileInput = this.querySelector('input[type="file"]');
		if (fileInput) {
			fileInput.addEventListener('change', e => this.handleAvatarUpload(e));
		}
		const logoutBtn = this.querySelector('#logout-button');
		if (logoutBtn) {
			logoutBtn.addEventListener('click', () => this.logout());
		}
		const toggleHistoryBtn = this.querySelector('#toggle-history-btn');
if (toggleHistoryBtn) {
	toggleHistoryBtn.addEventListener('click', () => {
		this.showAllHistory = !this.showAllHistory;
		this.render();
	});
}

	}
}

customElements.define('profile-view', ProfileView);
