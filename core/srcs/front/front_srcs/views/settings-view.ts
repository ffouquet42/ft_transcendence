import ApiService from '../services/api.service';
import { SettingsService } from '../services/settings-service';
import type { GameSettings } from '../services/settings-service';
import { sanitizeHTML } from '../services/sanitize';

class SettingsView extends HTMLElement {
	private settings: GameSettings;
	private settingsService = SettingsService.getInstance();
	private user = { username: '', twoFactorEnabled: false };
	private newUsername = '';
	private newPassword = '';
	private confirmPassword = '';
	private code2FA = '';
	private qrCode = '';
	private usernameSuccessMessage = '';
	private usernameErrorMessage = '';
	private passwordSuccessMessage = '';
	private passwordErrorMessage = '';
	private twoFASuccessMessage = '';
	private twoFAErrorMessage = '';
	private settingsSuccessMessage = '';
	private settingsErrorMessage = '';

	constructor() {
		super();
		this.settings = this.settingsService.getSettings();
	}

	connectedCallback() {
		this.loadUser();
	}

	validateNumberInput(field: keyof GameSettings, value: string) {
		const errorEl = document.getElementById(`${field}-error`);
		const num = Number(value);

		if (!/^\d+$/.test(value) || num < 1 || num > 20) {
			this.settings = { ...this.settings, [field]: 1 };
			if (errorEl) errorEl.textContent = 'Must be a number between 1 and 20';
			return;
		}

		this.settings = { ...this.settings, [field]: num };
		if (errorEl) errorEl.textContent = '';
	}

	async loadUser() {
		try {
			const profile = await ApiService.getProfile();
			this.user = {
				username: profile.username,
				twoFactorEnabled: profile.twoFactorEnabled,
			};
		} catch {
		}
		this.render();
	}

	private renderMessage(success: string, error: string): string {
		if ((this as any)[success]) {
			return `<p class="text-green-400 text-sm mb-2">${(this as any)[success]}</p>`;
		}
		if ((this as any)[error]) {
			return `<p class="text-red-400 text-sm mb-2">${(this as any)[error]}</p>`;
		}
		return '';
	}

	handleInput(e: Event, field: keyof this) {
		const input = e.target as HTMLInputElement;
		const cursorPosition = input.selectionStart ?? 0;
		const previousLength = (this[field] as string).length;
		
		(this[field] as string) = sanitizeHTML(input.value);
		
		input.value = this[field] as string;
		
		let newCursorPosition = cursorPosition;
		
		if ((this[field] as string).length < previousLength) {
			newCursorPosition = cursorPosition;
		} 
		else if ((this[field] as string).length > previousLength) {
			newCursorPosition = cursorPosition + ((this[field] as string).length - previousLength);
		}
		
		input.setSelectionRange(newCursorPosition, newCursorPosition);
	}

	render() {
		const twoFAContent = this.qrCode
			? this.renderQRCodeInput()
			: this.user.twoFactorEnabled
				? `<p class="text-green-400">✅ 2FA enabled</p>`
				: this.renderEnable2FAButton();

		this.innerHTML = `
			<div class="flex flex-col space-y-8 m-20 px-20">
				<div class="flex justify-between gap-4">
					${this.renderUserSettings(twoFAContent)}
					${this.renderGameSettings()}
				</div>
			</div>
		`;
	}

	renderUserSettings(twoFAContent: string): string {
		return `
			<div class="w-1/2">
				<div class="flex justify-center items-center p-4">
					<div class="p-[2px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg w-full max-w-md">
						<form class="bg-gray-800 p-6 rounded-2xl w-full">
							<h2 class="text-2xl font-semibold mb-6 text-center">User Settings</h2>
							<div class="mb-6 text-center">
								<p class="text-white text-sm">Logged in as</p>
								<p class="text-xl font-semibold text-indigo-300">${sanitizeHTML(this.user.username)}</p>
							</div>
							${this.renderTextInput('New Username', 'newUsername', this.newUsername, 'text', true)}
							${this.renderActionButton('Update Username', () => this.updateUsername())}
							${this.renderMessage('usernameSuccessMessage', 'usernameErrorMessage')}
							<h3 class="text-white font-medium text-sm mt-6 mb-2">Change Password</h3>
							${this.renderTextInput('New Password', 'newPassword', this.newPassword, 'password', true)}
							${this.renderTextInput('Confirm Password', 'confirmPassword', this.confirmPassword, 'password', true)}
							${this.renderActionButton('Update Password', () => this.updatePassword())}
							${this.renderMessage('passwordSuccessMessage', 'passwordErrorMessage')}
							<div class="mt-6 text-white font-medium text-sm text-center mb-2">Two-Factor Authentication (2FA)</div>
							<div class="text-center">${twoFAContent}</div>
						</form>
					</div>
				</div>
			</div>
		`;
	}

	renderGameSettings(): string {
		return `
			<div class="w-1/2">
				<div class="flex justify-center items-center p-4">
					<div class="p-[2px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg w-full max-w-md">
						<div class="bg-gray-800 p-6 rounded-2xl w-full">
							<h2 class="text-2xl font-semibold mb-6 text-center">Game Settings</h2>
							${this.renderColorOptions('Ball Color', 'ballColor')}
							${this.renderColorOptions('Paddle Color', 'paddleColor')}
							${this.renderGameSettingInputs()}
							${this.renderMessage('settingsSuccessMessage', 'settingsErrorMessage')}
							${this.renderActionButton('Save', () => this.saveSettings())}
						</div>
					</div>
				</div>
			</div>
		`;
	}

	renderTextInput(label: string, name: string, value: string, type: string, isUserField = false): string {
		const onInput = isUserField
			? `document.querySelector('settings-view').handleInput(event, '${name}')`
			: `document.querySelector('settings-view').updateSetting('${name}', this.value)`;

		return `
			<div class="mb-2">
				<label class="block text-white text-sm font-medium mb-1">${label}</label>
				<div class="p-[2px] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
					<input type="${type}" name="${name}" value="${sanitizeHTML(value)}" placeholder="${label}" class="w-full px-4 py-2 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-0" oninput="${onInput}" />
				</div>
			</div>
		`;
	}

	renderActionButton(text: string, action: () => void): string {
		const fnName = `action_${text.replace(/\s+/g, '')}`;
		(this as any)[fnName] = action;
		return `<button type="button" class="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-full transition hover:opacity-90 mb-6" onclick="document.querySelector('settings-view').${fnName}()">${text}</button>`;
	}

	renderColorOptions(label: string, key: keyof GameSettings): string {
		const colors = ['black', 'red', 'blue', 'green', 'yellow', 'purple'];
		const colorClasses: Record<string, string> = {
			black: 'bg-black', red: 'bg-red-500', blue: 'bg-blue-500',
			green: 'bg-green-500', yellow: 'bg-yellow-500', purple: 'bg-purple-500'
		};

		return `
			<label class="block text-sm font-medium text-white mb-2">${label}</label>
			<div class="flex space-x-2 mb-4">
				${colors.map(color => `
					<label class="relative">
						<input type="radio" name="${key}" value="${color}" class="peer hidden"
							${this.settings[key] === color ? 'checked' : ''}
							onchange="document.querySelector('settings-view').updateSetting('${key}', '${color}')">
						<div class="w-7 h-7 rounded-full flex items-center justify-center peer-checked:ring-2 ring-white">
							<div class="w-6 h-6 rounded-full ${colorClasses[color]}"></div>
						</div>
					</label>
				`).join('')}
			</div>
		`;
	}

	renderNumberInput(label: string, name: string, value: number): string {
		return `
			<div class="mb-2">
				<label class="block text-white text-sm font-medium mb-1">${label}</label>
				<div class="p-[2px] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
					<input
						type="text"
						name="${name}"
						value="${value ?? ''}"
						class="w-full px-4 py-2 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-0"
						oninput="document.querySelector('settings-view').validateNumberInput('${name}', this.value)"
						autocomplete="off"
					/>
				</div>
				<div class="text-red-400 text-xs" id="${name}-error"></div>
			</div>
		`;
	}

	renderGameSettingInputs(): string {
		const labels: Record<string, string> = {
			endScore: 'End Score', ballSpeed: 'Ball Speed', paddleSpeed: 'Paddle Speed'
		};

		return Object.entries(labels)
			.map(([key, label]) =>
				this.renderNumberInput(
					label,
					key,
					Number(this.settings[key as keyof GameSettings]) || 0
				)
			)
			.join('');
	}

	renderQRCodeInput(): string {
		return `
			<p class="text-white text-sm mb-2">Scan this QR code with your authenticator app:</p>
			<img src="${this.qrCode}" alt="QR Code" class="mb-2 max-w-xs text-center" />
			${this.renderTextInput('Enter 2FA code', 'code2FA', this.code2FA, 'text', true)}
			${this.renderActionButton('Verify 2FA', () => this.verify2FA())}
			${this.renderMessage('twoFASuccessMessage', 'twoFAErrorMessage')}
		`;
	}

	renderEnable2FAButton(): string {
		return `
			<div>
				<button type="button" onclick="document.querySelector('settings-view').setup2FA()" class="w-full px-4 py-2 bg-gradient-to-r from-white via-pink-100 to-purple-200 text-slate-900 hover:opacity-90 rounded-full">Enable 2FA</button>
				${this.renderMessage('twoFASuccessMessage', 'twoFAErrorMessage')}
			</div>
		`;
	}

	updateSetting(key: keyof GameSettings, value: string) {
		const isNumericField = ['endScore', 'ballSpeed', 'paddleSpeed'].includes(key);
		if (isNumericField) {
			const parsed = parseInt(value, 10);
			if (isNaN(parsed) || parsed <= 0) {
				this.settingsErrorMessage = `Invalid value for "${key}". Please enter a positive number.`;
				this.settingsSuccessMessage = '';
				this.render();
				return;
			}
			this.settings = { ...this.settings, [key]: parsed };
		} else {
			this.settings = { ...this.settings, [key]: value };
		}
		this.settingsErrorMessage = '';
		this.settingsSuccessMessage = '';
		this.render();
	}

	saveSettings() {
		try {
			this.settingsService.updateSettings(this.settings);
			this.settingsSuccessMessage = 'Settings saved successfully.';
			this.settingsErrorMessage = '';
		} catch {
			this.settingsErrorMessage = 'Failed to save settings.';
			this.settingsSuccessMessage = '';
		}
		this.render();
	}

	async updateUsername() {
		this.usernameSuccessMessage = '';
		this.usernameErrorMessage = '';
		if (!this.newUsername.trim()) {
			this.usernameErrorMessage = 'New username cannot be empty.';
			return this.render();
		}
		try {
			const updatedUser = await ApiService.updateUser({ username: this.user.username, newUsername: this.newUsername });
			this.user.username = updatedUser.username;
			this.newUsername = '';
			this.usernameSuccessMessage = 'Username updated successfully.';
		} catch {
			this.usernameErrorMessage = 'Failed to update username.';
		}
		this.render();
	}

	async updatePassword() {
		this.passwordSuccessMessage = '';
		this.passwordErrorMessage = '';
		if (!this.newPassword || !this.confirmPassword) {
			this.passwordErrorMessage = 'Please fill in both password fields.';
			return this.render();
		}
		if (this.newPassword !== this.confirmPassword) {
			this.passwordErrorMessage = 'Passwords do not match.';
			return this.render();
		}
		try {
			await ApiService.updatePassword(this.user.username, this.newPassword);
			this.newPassword = '';
			this.confirmPassword = '';
			this.passwordSuccessMessage = 'Password updated successfully.';
		} catch {
			this.passwordErrorMessage = 'Failed to update password.';
		}
		this.render();
	}

	async setup2FA() {
		this.twoFASuccessMessage = '';
		this.twoFAErrorMessage = '';
		try {
			const res = await ApiService.setup2FA();
			this.qrCode = res.qrCode;
		} catch {
			this.twoFAErrorMessage = 'Failed to generate QR code';
		}
		this.render();
	}

	async verify2FA() {
		this.twoFASuccessMessage = '';
		this.twoFAErrorMessage = '';
		try {
			await ApiService.verify2FASetup(this.code2FA);
			this.user.twoFactorEnabled = true;
			localStorage.setItem('user', JSON.stringify(this.user));
			this.qrCode = '';
			this.code2FA = '';
			this.twoFASuccessMessage = '2FA successfully enabled.';
		} catch {
			this.twoFAErrorMessage = 'Failed to verify 2FA code.';
		}
		this.render();
	}
}

customElements.define('settings-view', SettingsView);