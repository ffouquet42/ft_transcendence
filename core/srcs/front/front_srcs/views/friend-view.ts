import ApiService from '../services/api.service';
import { API_BASE_URL } from '../config';
import { sanitizeHTML } from '../services/sanitize';

type Friend = { id: number; username: string; avatar: string };


class FriendView extends HTMLElement {
  	private username = '';
  	private message = '';
  	private messageType: 'success' | 'error' | '' = '';
  	private friends: { id: number; username: string; avatar: string }[] = [];
  	private onlineUserIds: number[] = [];

  	constructor() {
		super();
  	}

  	connectedCallback() {
		this.loadFriends();
		this.setupWebSocket();
  	}

  	setupWebSocket() {
		const socket = new WebSocket(`${API_BASE_URL.replace(/^http/, 'ws')}/ws`);
		socket.onopen = () => {
	  		const token = localStorage.getItem('token');
	  		if (token) {
				socket.send(JSON.stringify({ type: 'auth', payload: { token } }));
	  		}
		};
		socket.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.type === 'user-status') {
					this.handleUserStatus(data.payload); 
				}
			} catch (err) {
				console.error('Invalid WebSocket message', err);
			}
		};
  	}

  	handleUserStatus(data: { userId: number; status: 'online' | 'offline' }) {
		if (data.status === 'online' && !this.onlineUserIds.includes(data.userId)) {
	  		this.onlineUserIds.push(data.userId);
		} else if (data.status === 'offline') {
	  		this.onlineUserIds = this.onlineUserIds.filter(id => id !== data.userId);
		}
		this.render();
  	}

  	async loadFriends() {
		try {
	  		const result = await ApiService.getFriends();
	  		this.friends = (result.friends || result).map((friend: Friend) => ({
				...friend,
				avatar: friend.avatar
				? friend.avatar.replace(/^\/?avatars\/?/, '')
				: ''
	  		}));
	  		this.render();
		} catch (err) {
	  		this.message = 'Error loading friends';
	  		this.messageType = 'error';
	  		this.render();
		}
  	}

  	async handleAddFriend(e: Event) {
		e.preventDefault();
		this.message = '';
		this.messageType = '';
		if (!this.username.trim()) {
	  		this.message = 'Please enter a username';
	  		this.messageType = 'error';
	  		this.render();
	  		return;
		}

		try {
	  		const result = await ApiService.addFriend(this.username);
	  		this.message = result.message || 'Friend added';
	  		this.messageType = 'success';
	  		this.username = '';
	  		await this.loadFriends();
		} catch (err: any) {
	  		this.message = err.message || 'Error';
	  		this.messageType = 'error';
	  		this.render();
		}
  	}

  	async handleRemoveFriend(friendId: number) {
		this.message = '';
		this.messageType = '';
		try {
	  		const result = await ApiService.removeFriend(friendId);
	  		this.message = result.message || 'Friend removed';
	  		this.messageType = 'success';
	  		await this.loadFriends();
		} catch (err: any) {
	  		this.message = err.message || 'Error';
	  		this.messageType = 'error';
	  		this.render();
		}
  	}

	handleInput(e: Event) {
		const input = e.target as HTMLInputElement;
		this.username = sanitizeHTML(input.value);
		input.value = this.username;
	}

  	render() {
		this.innerHTML = '';

		const main = document.createElement('main');
		main.className = 'flex justify-center items-center min-h-[60vh] p-6';

		const wrapper = document.createElement('div');
		wrapper.className = 'p-[2px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg w-full max-w-xl';

		const card = document.createElement('div');
		card.className = 'bg-gray-800 rounded-2xl p-8 w-full';

		const content = `
	  		<h2 class="text-3xl font-bold mb-6 text-center text-white">Friend List</h2>
	  		<form class="flex gap-2 mb-6" onsubmit="return false;">
				<input type="text" name="username" placeholder="Enter username" value="${sanitizeHTML(this.username)}" class="flex-1 px-4 py-2 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none" required />
				<button type="submit" class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold px-4 py-2 rounded-full transition">Add Friend</button>
	  		</form>
	  		${this.message ? `<div class="text-center font-semibold ${this.messageType === 'success' ? 'text-green-400' : 'text-red-500'} mb-4">${sanitizeHTML(this.message)}</div>` : ''}
	  		<ul class="space-y-4">
				${this.friends.map(friend => `
		  		<li class="flex items-center justify-between bg-gray-700 p-4 rounded-xl">
					<div class="flex items-center gap-4">
			  			<img src="${friend.avatar?.startsWith('/avatars/') ? `${API_BASE_URL}${friend.avatar}` : `${API_BASE_URL}/avatars/${friend.avatar || 'default.png'}`}" width="40" height="40" class="rounded-full" />
			  			<span class="text-white">${sanitizeHTML(friend.username)}</span>
			  			<span class="w-3 h-3 rounded-full ${this.onlineUserIds.includes(friend.id) ? 'bg-green-500' : 'bg-gray-400'}" title="${this.onlineUserIds.includes(friend.id) ? 'Online' : 'Offline'}"></span>
					</div>
					<button data-remove="${friend.id}" class="text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-1 rounded-full">Remove</button>
		  		</li>
				`).join('')}
	  		</ul>
		`;

		card.innerHTML = content;
		wrapper.appendChild(card);
		main.appendChild(wrapper);
		this.appendChild(main);

		this.querySelector('form')?.addEventListener('submit', this.handleAddFriend.bind(this));
		this.querySelector('input[name="username"]')?.addEventListener('input', this.handleInput.bind(this));
		this.querySelectorAll('[data-remove]').forEach(button => {
	  		button.addEventListener('click', (e) => {
				const id = Number((e.target as HTMLElement).getAttribute('data-remove'));
				this.handleRemoveFriend(id);
	  		});
		});
  	}
}

customElements.define('friend-view', FriendView);