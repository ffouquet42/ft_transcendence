import { WebSocketService } from './websocket-service';

const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const backendPort = 3000;
const hostname = window.location.hostname;
const wsUrl = `${protocol}://${hostname}:${backendPort}/ws`;

export const wsInstance = new WebSocketService(wsUrl);
