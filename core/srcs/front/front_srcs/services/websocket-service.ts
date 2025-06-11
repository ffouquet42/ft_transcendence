export class WebSocketService {
	private ws: WebSocket | null = null;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectTimeout = 1000;
	private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
	private messageQueue: { type: string; data: any }[] = [];

	constructor(private url: string) {
		const isSecure = window.location.protocol === 'https:';
		if (isSecure && this.url.startsWith('ws://')) {
			this.url = this.url.replace('ws://', 'wss://');
		}

		if (!this.url.startsWith('wss://') && isSecure) {
			throw new Error('WebSocket URL must use WSS protocol for secure connection');
		}

		this.connect();
	}

	private connect() {
		try {
			this.ws = new WebSocket(this.url);

			this.ws.onopen = () => {
				this.reconnectAttempts = 0;


				const token = localStorage.getItem('token');
				if (token) {
					this.send('auth', { token });
				} else {
					console.warn('[WS] Aucun token trouvé pour WebSocket');
				}

				while (this.messageQueue.length > 0) {
					const msg = this.messageQueue.shift();
					if (msg) this.send(msg.type, msg.data);
				}
			};

			this.ws.onmessage = (event) => {
				try {
					const message = JSON.parse(event.data);
					this.handleMessage(message);
				} catch (error) {
					console.error('Error processing message:', error);
				}
			};

			this.ws.onclose = () => {
				this.handleReconnect();
			};

			this.ws.onerror = (error) => {
				console.error('[WS] Error:', error);
			};
		} catch (error) {
			console.error('[WS] Connection error:', error);
			this.handleReconnect();
		}
	}

	private handleReconnect() {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			setTimeout(() => {
				this.connect();
			}, this.reconnectTimeout * this.reconnectAttempts);
		} else {
			console.error('[WS] Max reconnect attempts reached');
		}
	}

	private handleMessage(message: any) {
		
		const handlers = this.messageHandlers.get(message.type) || [];
	 handlers.forEach(handler => handler(message));

	}

	public on(type: string, handler: (data: any) => void) {
		if (!this.messageHandlers.has(type)) {
			this.messageHandlers.set(type, []);
		}
		this.messageHandlers.get(type)?.push(handler);
	}

	public off(type: string, handler: (data: any) => void) {
		const handlers = this.messageHandlers.get(type) || [];
		const index = handlers.indexOf(handler);
		if (index !== -1) {
			handlers.splice(index, 1);
		}
	}

public send(type: string, data: any) {
	const message = JSON.stringify({ type, payload: data });

	if (this.ws?.readyState === WebSocket.OPEN) {
		this.ws.send(message);
	} else {
		console.warn('[WS] Not connected, queuing message:', { type, data });
		this.messageQueue.push({ type, data });
	}
}


	public disconnect() {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
	}
}
