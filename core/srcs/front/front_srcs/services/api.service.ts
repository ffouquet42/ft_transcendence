import { API_BASE_URL } from '../config';
import { navigateTo } from '../app';

function logoutAndRedirect() {
	localStorage.removeItem('token');
	localStorage.removeItem('user');
	localStorage.removeItem('gameSettings');
	navigateTo('/login');
}

export default class ApiService {


	static async getUserStats(userId: number) {
		const token = localStorage.getItem('token');
		if (!token) throw new Error('Utilisateur non authentifié');

		const res = await fetch(`${API_BASE_URL}/auth/users/${userId}/stats`, {
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});

		if (!res.ok) {
			const err = await res.json().catch(() => null);
			throw new Error(err?.message || 'Impossible de récupérer les stats utilisateur');
		}

		return res.json();
	}

static async blockUser(blockedId: number) {
	const token = localStorage.getItem('token');
	const res = await fetch(`${API_BASE_URL}/auth/block`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({ blockedId })
	});
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		console.error('[ApiService.blockUser] HTTP', res.status, text);
		throw new Error(`Failed to block user (status ${res.status})`);
	}
	return res.json();
}

static async unblockUser(unblockId: number) {
	const token = localStorage.getItem('token');
	const res = await fetch(`${API_BASE_URL}/auth/unblock`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({ unblockId })
	});
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		console.error('[ApiService.unblockUser] HTTP', res.status, text);
		throw new Error(`Échec du déblocage (status ${res.status} : ${text})`);
	}
	return res.json();
}

	static async getBlockedUsers(): Promise<number[]> {
	const token = localStorage.getItem('token');
	if (!token) throw new Error('Utilisateur non authentifié');

	const res = await fetch(`${API_BASE_URL}/auth/blocked`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	});

	if (!res.ok) {
		const text = await res.text().catch(() => null);
		throw new Error(text || 'Impossible de récupérer la liste des bloqués');
	}
	return (await res.json()) as number[];
}



		private static readonly MAX_RETRIES = 3;
		private static readonly RETRY_DELAY_MS = 1000;
		private static readonly TIMEOUT_MS = 5000;
		private static readonly baseUrl = API_BASE_URL;
		
private static getFetchOptions(options: RequestInit): RequestInit {
	const token = localStorage.getItem('token');

	return {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(options.headers || {}),
			...(token ? { Authorization: `Bearer ${token}` } : {})
		}
	};
}

static async getProfile() {
	const token = localStorage.getItem('token');
	if (!token) throw new Error('Not authenticated');

	const response = await this.fetchWithTimeout(`${this.baseUrl}/auth/me`, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${token}`
		}
	});

	const json = await this.safeParseJSON(response);
	if (!response.ok) {
		throw new Error(json?.error || 'Failed to fetch profile');
	}

	return json;
}



		private static async fetchWithRetry(url: string, options: RequestInit, retries = this.MAX_RETRIES): Promise<Response> {
				try {
						return await fetch(url, this.getFetchOptions(options));
				} catch (error) {
						if (retries > 0) {
								await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY_MS));
								return this.fetchWithRetry(url, options, retries - 1);
						}
						throw error;
				}
		}

static async updateUser(data: { username: string; newUsername?: string }) {
	const response = await this.fetchWithTimeout(`${this.baseUrl}/auth/update`, {
		method: 'PUT',
		body: JSON.stringify(data),
	});

	const json = await this.safeParseJSON(response);

	if (!response.ok) {
		throw new Error(json?.error || 'Update failed');
	}

	return json.user; 
}

static async updatePassword(username: string, newPassword: string) {
	const response = await this.fetchWithTimeout(`${this.baseUrl}/auth/password`, {
		method: 'PUT',
		body: JSON.stringify({ username, newPassword })
	});

	const json = await this.safeParseJSON(response);
	if (!response.ok) {
		throw new Error(json?.error || 'Failed to update password');
	}

	return json;
}



private static async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

		try {
				const response = await this.fetchWithRetry(url, { ...options, signal: controller.signal });

				if (response.status === 401 || response.status === 403) {
						logoutAndRedirect();
						throw new Error('Session expirée ou non autorisée');
				}
				return response;
		} finally {
				clearTimeout(timeoutId);
		}
}


		private static async safeParseJSON(response: Response): Promise<any> {
				const text = await response.text();
				if (!text) return {};
				try {
						return JSON.parse(text);
				} catch (err) {
						console.error('Failed to parse JSON:', text);
						throw new Error('Invalid JSON returned from server');
				}
		}

static async register(username: string, password: string) {
	try {
		const response = await this.fetchWithTimeout(`${this.baseUrl}/auth/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, password })
		});

		const json = await this.safeParseJSON(response);

		if (!response.ok) {
			throw new Error(json?.error || 'Registration failed');
		}

		return json;

	} catch (error) {
		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				throw new Error('Request timed out. Please try again.');
			}
			throw error;
		}
		throw new Error('An unexpected error occurred');
	}
}


static async login(username: string, password: string) {
	const res = await fetch(`${this.baseUrl}/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password }),
	});

	if (!res.ok) throw new Error('Login failed');
	const json = await res.json();

	if (json.twofa) {
		sessionStorage.setItem('pendingUser', JSON.stringify({
			id: json.userId,
			username: json.username
		}));
		return json;
	}

	localStorage.setItem('token', json.token);
	localStorage.setItem('user', JSON.stringify(json.user));
	return json;
}


static async setup2FA() {
	const token = localStorage.getItem('token');
	const response = await this.fetchWithTimeout(`${this.baseUrl}/auth/2fa/setup`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}` },
		body: JSON.stringify({})
	});

	const json = await this.safeParseJSON(response);

	if (!response.ok) {
		throw new Error(json?.error || 'Failed to setup 2FA');
	}

	return json;
}

static async verify2FASetup(code: string) {
	const token = localStorage.getItem('token');
	const res = await fetch(`${this.baseUrl}/auth/2fa/verify`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({ token: code })
	});

	if (!res.ok) throw new Error('Échec vérification 2FA');
	return res.json();
}


static async verify2FA(code: string) {
	const pending = JSON.parse(sessionStorage.getItem('pendingUser') || '{}');
	if (!pending.id) throw new Error('Missing pending session');

	const res = await fetch(`${this.baseUrl}/auth/2fa/verify-login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ userId: pending.id, token: code }),
	});

	if (!res.ok) throw new Error('Échec de la vérification 2FA');

	const json = await res.json();

	localStorage.setItem('token', json.token);
	localStorage.setItem('user', JSON.stringify(json.user));
	sessionStorage.removeItem('pendingUser');

	return json;
}


static async validateUsername(username: string): Promise<{ valid: boolean; message?: string; id?: number; avatar?: string;}> {
	const token = localStorage.getItem('token');
	const res = await fetch(`${this.baseUrl}/tournament/validate-username`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({ username })
	});

	if (!res.ok) throw new Error('Failed to validate username');
	return await res.json();
}



static logout() {
	localStorage.removeItem('token');
	localStorage.removeItem('user');
}

static async uploadAvatar(file: File): Promise<string> {
	const token = localStorage.getItem('token');
	const formData = new FormData();
	formData.append('file', file);

	const response = await fetch(`${this.baseUrl}/auth/upload-avatar`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`
		},
		body: formData
	});

	if (!response.ok) {
		throw new Error('Avatar upload failed');
	}

	const data = await response.json();
	return data.avatarUrl;
}

static async addFriend(username: string) {
	const token = localStorage.getItem('token');
	const res = await fetch(`${this.baseUrl}/auth/friends/add`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({ username })
	});

	const json = await res.json();
	if (!res.ok) throw new Error(json?.error || 'Failed to add friend');
	return json;
}

static async getFriends() {
	const token = localStorage.getItem('token');
	const response = await fetch(`${this.baseUrl}/auth/friends`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	const raw = await response.text();
	console.warn('🟡 Raw friends response:', raw);

	if (!response.ok)
		throw new Error(`Failed to fetch friends: ${response.status}`);

	return JSON.parse(raw);
}



static async getMessages(friendId: string) {
	const res = await fetch(`${API_BASE_URL}/chat/messages/${friendId}`, {
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('token')}`
		}
	});

	const data = await res.json();
	return Array.isArray(data) ? data : data.messages || [];
}

static async sendMessage({ receiverId, content }: { receiverId: number; content: string }) {
	const res = await fetch(`${API_BASE_URL}/chat/message`, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('token')}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ receiverId, content })
	});

	if (!res.ok) {
		const err = await res.json();
		throw new Error(err.message || 'Failed to send message');
	}

	return res.json();
}

static async removeFriend(friendId: number) {
	const token = localStorage.getItem('token');
	const res = await fetch(`${this.baseUrl}/auth/friends/remove`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({ friendId })
	});

	const json = await res.json();
	if (!res.ok) throw new Error(json?.error || 'Failed to remove friend');
	return json;
}

static async getUserById(id: string) {
	const token = localStorage.getItem('token');
	const response = await fetch(`${this.baseUrl}/profile/users/${id}`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	});

	const json = await this.safeParseJSON(response);

	if (!response.ok) {
		throw new Error(json?.error || 'Failed to fetch user');
	}

	return json;
}


	private static getToken() {
		return localStorage.getItem('token');
	}



	static async getMatchHistory() {
		const token = ApiService.getToken();
		const res = await fetch(`${API_BASE_URL}/profile/history`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		});

		if (!res.ok) {
			throw new Error(`Erreur ${res.status}`);
		}

		return (await res.json()) as Array<{
			match_id: number;
			user_id: number;
			opponent: string;
			result: 'win' | 'loss';
			score_user: number;
			score_opponent: number;
			played_at: string;
		}>;
	}




	static async getUserMatchHistory(userId: number) {
		const token = this.getToken();
		const res = await fetch(`${this.baseUrl}/profile/users/${userId}/history`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		});

		if (!res.ok) {
			throw new Error(`Erreur ${res.status} en récupérant l’historique utilisateur`);
		}

		return (await res.json()) as Array<{
			match_id: number;
			user_id: number;
			opponent: string;
			result: 'win' | 'loss';
			score_user: number;
			score_opponent: number;
			played_at: string;
		}>;
	}
}
