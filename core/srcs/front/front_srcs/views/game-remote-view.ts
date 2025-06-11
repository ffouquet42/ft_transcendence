import { navigateTo } from '@/app';
import { API_BASE_URL } from '../config';

interface GameState {
	ball: { x: number; y: number; size: number; speed: number; dx: number; dy: number };
	paddles: {
		player1: { x: number; y: number; width: number; height: number; speed: number };
		player2: { x: number; y: number; width: number; height: number; speed: number };
	};
	player1Name: string;
	player2Name: string;
	score: { player1: number; player2: number };
	isGameOver: boolean;
	winner: string | null;
	waitingForStart: boolean;
	countdown: number | null;
	isPaused: boolean;
}

const CANVAS_ASPECT_RATIO = 16 / 9;

class GameRemoteView extends HTMLElement {
	private canvas!: HTMLCanvasElement;
	private ctx!: CanvasRenderingContext2D;
	private socket: WebSocket | null = null;
	private keysPressed: Set<string> = new Set();
	private currentState: GameState | null = null;
	private sessionId: string = '';
	private playerId: number = 0;
	private hasStarted: boolean = false;

	constructor() {
		super();
	}

	connectedCallback() {
		const userJson = localStorage.getItem('user') || '{}';
		const user = JSON.parse(userJson);
		this.playerId = user?.id ?? 0;

		const urlParams = new URLSearchParams(window.location.search);
		this.sessionId = urlParams.get('id') || '';

		this.render();

		const leaveBtn = this.querySelector('#leave-button') as HTMLButtonElement | null;
		if (leaveBtn) {
			leaveBtn.addEventListener('click', () => {
				navigateTo('/chat');
			});
		}

		this.initWebSocket(this.sessionId, String(this.playerId));

		window.addEventListener('keydown', this.handleKeyDown);
		window.addEventListener('keyup', this.handleKeyUp);
	}

	disconnectedCallback() {
		window.removeEventListener('keydown', this.handleKeyDown);
		window.removeEventListener('keyup', this.handleKeyUp);
		window.removeEventListener('resize', this.resizeCanvas);
		this.close();
	}

	private render() {
		this.innerHTML = `
			<div class="flex flex-col items-center justify-center w-full min-h-[calc(100vh-80px)] p-2 relative">
				<!-- En‐tête : noms et score -->
				<div class="relative flex justify-center items-center w-full max-w-[1000px] mb-4">
					<span
						id="player1-label"
						class="absolute left-0 px-4 py-2 bg-gradient-to-r from-white via-pink-100 to-purple-200
									 text-slate-900 rounded-full text-sm font-semibold z-10"
					>
						Player 1
					</span>
					<span
						id="score"
						class="px-8 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
									 text-white rounded-full text-2xl font-bold mx-20 z-10"
					>
						0 - 0
					</span>
					<span
						id="player2-label"
						class="absolute right-0 px-4 py-2 bg-gradient-to-r from-white via-pink-100 to-purple-200
									 text-slate-900 rounded-full text-sm font-semibold z-10"
					>
						Player 2
					</span>
				</div>

				<!-- Canevas Pong -->
				<div class="w-4/5 max-w-[1000px] min-w-[300px] rounded-xl p-[5px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
					<div class="bg-white rounded-xl overflow-hidden">
						<canvas id="pongCanvas" class="w-full h-[60vh] min-h-[200px]"></canvas>
					</div>
				</div>

				<!-- Instructions touches -->
				<div class="flex flex-wrap justify-center gap-4 mt-6 z-10">
					<span class="px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
											 text-white text-sm rounded-full shadow-md">
						Both players :
						<span class="inline-block px-2 py-1 bg-white text-slate-900 rounded shadow-inner font-bold text-xs">
							W
						</span>
						<span class="inline-block px-2 py-1 bg-white text-slate-900 rounded shadow-inner font-bold text-xs">
							S
						</span>
					</span>
					<span class="px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
											 text-white text-sm rounded-full shadow-md">
						Pause :
						<span class="inline-block px-2 py-1 bg-white text-slate-900 rounded shadow-inner font-bold text-xs">
							G
						</span>
					</span>
				</div>

				<!-- Nouvelle ligne d’information sous “Both players: W/S” -->
				<p class="mt-6 text-gray-200 text-sm">
					First to 5 wins!
				</p>
				<button
					id="leave-button"
					class="px-4 py-2 bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white rounded-full hover:opacity-90 transition hidden"
				>
					Leave the game
				</button>
			</div>
		`;

		this.canvas = this.querySelector('canvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d')!;

		this.resizeCanvas();
		this.drawInitialScreen();
	}

	private initWebSocket(sessionId: string, playerId: string) {
		const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
		const baseUrl = API_BASE_URL.replace(/^https?/, wsProtocol) + '/ws';
		const wsUrl = `${baseUrl}?sessionId=${sessionId}&playerId=${playerId}`;

		this.socket = new WebSocket(wsUrl);

		this.socket.onopen = () => {
			const token = localStorage.getItem('token');
			if (token) {
				this.socket?.send(JSON.stringify({ type: 'auth', payload: { token } }));
			}
		};

		this.socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			this.handleMessage(data);
		};

		this.socket.onclose = (ev) => {
			console.log('🔌 WebSocket closed, code =', ev.code, 'reason =', ev.reason);
		};

		this.socket.onerror = (err) => {
			console.error('WebSocket error:', err);
		};

		window.addEventListener('resize', this.resizeCanvas);
	}

	private handleMessage(data: any) {
		if (data.type === 'state') {
			this.currentState = data.payload as GameState;

			const player1Label = this.querySelector('#player1-label') as HTMLSpanElement | null;
			const player2Label = this.querySelector('#player2-label') as HTMLSpanElement | null;
			if (player1Label) player1Label.textContent = data.payload.player1Name;
			if (player2Label) player2Label.textContent = data.payload.player2Name;

			const scoreEl = this.querySelector('#score') as HTMLSpanElement | null;
			if (scoreEl) {
				scoreEl.textContent = `${data.payload.score.player1} - ${data.payload.score.player2}`;
			}

			const leaveBtn = this.querySelector('#leave-button') as HTMLButtonElement | null;
			if (leaveBtn) {
				if (data.payload.isGameOver) {
					leaveBtn.classList.remove('hidden');
				} else {
					leaveBtn.classList.add('hidden');
				}
			}

			if (this.currentState) {
				this.drawGame(this.currentState);
			}
		}
		if (data.type === 'draw') {
		if (this.currentState) {
			this.drawGame(this.currentState);
		}
		}
		if (data.type === 'opponent_disconnected') {
			console.warn('⚠️ Opponent disconnected');
			this.drawDisconnected(data.message);
		}
	}

	private drawInitialScreen() {
		const virtWidth = 768;
		const virtHeight = 432;
		const scaleX = this.canvas.width / virtWidth;
		const scaleY = this.canvas.height / virtHeight;

		this.ctx.save();
		this.ctx.scale(scaleX, scaleY);

		this.ctx.fillStyle = 'white';
		this.ctx.fillRect(0, 0, virtWidth, virtHeight);

		this.ctx.fillStyle = 'black';
		this.ctx.font = '28px Times New Roman';
		this.ctx.textAlign = 'center';
		this.ctx.fillText('Press ENTER to Start', virtWidth / 2, virtHeight / 2);

		this.ctx.restore();
	}

	private drawDisconnected(message: string) {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = 'white';
		this.ctx.font = '28px Times New Roman';
		this.ctx.textAlign = 'center';
		this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
	}

	private handleKeyDown = (e: KeyboardEvent) => {
		if (
			e.key === 'Enter' &&
			!this.hasStarted &&
			this.currentState &&
			this.currentState.waitingForStart
		) {
			this.hasStarted = true;
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

			this.socket?.send(
				JSON.stringify({
					type: 'game',
					payload: {
						action: 'start',
						playerId: this.playerId,
						sessionId: this.sessionId,
					},
				})
			);
		}
		if (e.key === 'w' || e.key === 's') {
			this.keysPressed.add(e.key);
			this.sendDirection();
		}
		if (e.key.toLowerCase() === 'g') {
			this.socket?.send(
				JSON.stringify({
				type: 'game',
				payload: {
					action: 'pause',
					playerId: this.playerId,
					sessionId: this.sessionId
				}
				})
			);
		}
	};

	private handleKeyUp = (e: KeyboardEvent) => {
		if (e.key === 'w' || e.key === 's') {
			this.keysPressed.delete(e.key);
			this.sendDirection();
		}
	};

	private sendDirection() {
		if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

		let direction: 'up' | 'down' | null = null;
		if (this.keysPressed.has('w') && !this.keysPressed.has('s')) {
			direction = 'up';
		} else if (this.keysPressed.has('s') && !this.keysPressed.has('w')) {
			direction = 'down';
		}

		this.socket.send(
			JSON.stringify({
				type: 'game',
				payload: {
					action: 'input',
					direction,
					playerId: this.playerId,
					sessionId: this.sessionId,
				},
			})
		);
	}

	private resizeCanvas = () => {
		if (!this.canvas.parentElement) return;
		const container = this.canvas.parentElement;
		let width = container.clientWidth;
		let height = width / CANVAS_ASPECT_RATIO;
		if (height > container.clientHeight) {
			height = container.clientHeight;
			width = height * CANVAS_ASPECT_RATIO;
		}
		this.canvas.width = width;
		this.canvas.height = height;
	};

	private drawGame(state: GameState) {
		const { ball, paddles, isGameOver, winner, waitingForStart, countdown, isPaused } = state;

		const virtWidth = 768;
		const virtHeight = 432;

		const scaleX = this.canvas.width / virtWidth;
		const scaleY = this.canvas.height / virtHeight;

		this.ctx.save();
		this.ctx.scale(scaleX, scaleY);

		if (waitingForStart) {
			this.ctx.fillStyle = 'white';
			this.ctx.fillRect(0, 0, virtWidth, virtHeight);

			this.ctx.fillStyle = 'black';
			this.ctx.font = '28px Times New Roman';
			this.ctx.textAlign = 'center';
			if (countdown !== null) {
				this.ctx.fillText(`${countdown}`, virtWidth / 2, virtHeight / 2);
			} else {
				this.ctx.fillText('Press ENTER to Start', virtWidth / 2, virtHeight / 2);
			}

			this.ctx.restore();
			return;
		}
		if (isGameOver) {
			this.ctx.fillStyle = 'white';
			this.ctx.fillRect(0, 0, virtWidth, virtHeight);

			this.ctx.fillStyle = 'black';
			this.ctx.font = '36px Times New Roman';
			this.ctx.textAlign = 'center';
			this.ctx.fillText(`${winner} wins!`, virtWidth / 2, virtHeight / 2 - 30);

			this.ctx.font = '24px Times New Roman';
			this.ctx.fillText(
				'You can leave the room and invite your friend to rematch !',
				virtWidth / 2,
				virtHeight / 2 + 30
			);

			this.ctx.restore();
			return;
		}

		this.ctx.fillStyle = '#ffffff';
		this.ctx.fillRect(0, 0, virtWidth, virtHeight);

		this.ctx.beginPath();
		this.ctx.setLineDash([5, 15]);
		this.ctx.moveTo(virtWidth / 2, 0);
		this.ctx.lineTo(virtWidth / 2, virtHeight);
		this.ctx.strokeStyle = '#000000';
		this.ctx.lineWidth = 2;
		this.ctx.stroke();
		this.ctx.setLineDash([]);

		this.ctx.fillStyle = '#000000';

		this.ctx.fillRect(
			paddles.player1.x,
			paddles.player1.y,
			paddles.player1.width,
			paddles.player1.height
		);
		this.ctx.fillRect(
			paddles.player2.x,
			paddles.player2.y,
			paddles.player2.width,
			paddles.player2.height
		);

		this.ctx.beginPath();
		this.ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2);
		this.ctx.fillStyle = '#000000';
		this.ctx.fill();
		this.ctx.closePath();

		if (isPaused) {


			this.ctx.font = 'bold 48px Arial';
			this.ctx.fillStyle = '#000';
			this.ctx.textAlign = 'center';
			this.ctx.fillText('Paused', virtWidth / 2, virtHeight / 2 - 30);
		}

		this.ctx.restore();
	}

	private close() {
		this.socket?.close();
	}
}

customElements.define('game-remote-view', GameRemoteView);