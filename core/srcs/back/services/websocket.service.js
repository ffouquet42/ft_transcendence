const WebSocket = require('ws');
const Database = require('better-sqlite3');
const db = new Database('/data/database.sqlite');
const { getUserById } = require('../db');

class GameSession {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.players = new Map();
    this.state = this.initState();
  }

  initState() {
    return {
      ball: { x: 384, y: 216, size: 10, speed: 5, dx: 5, dy: 5 },
      paddles: {
        player1: { x: 0, y: 200, width: 10, height: 100, speed: 5 },
        player2: { x: 758, y: 200, width: 10, height: 100, speed: 5 }
      },
      score: { player1: 0, player2: 0 },
      isGameOver: false,
      winner: null,
      endScore: 5,
      waitingForStart: true,
      countdown: null,
      isPaused: false
    };
  }

  update() {
    const { ball, paddles, score, isGameOver, winner, endScore, waitingForStart, countdown, isPaused } = this.state;

    if (this.state.isGameOver || this.state.waitingForStart || this.state.isPaused) return;
    ball.x += ball.dx;
    ball.y += ball.dy;
    if (ball.y <= 0 || ball.y + ball.size >= 432) {
      ball.dy *= -1;
    }
    for (const [userId, input] of this.players.entries()) {
      if (input === 'up') {
        if (this.isPlayer1(userId)) paddles.player1.y -= paddles.player1.speed;
        else paddles.player2.y -= paddles.player2.speed;
      } else if (input === 'down') {
        if (this.isPlayer1(userId)) paddles.player1.y += paddles.player1.speed;
        else paddles.player2.y += paddles.player2.speed;
      }
    }

    const ballHitsPaddle = (paddle) =>
      ball.y + ball.size >= paddle.y &&
      ball.y <= paddle.y + paddle.height;

    if (ball.dx < 0 && ball.x <= paddles.player1.x + paddles.player1.width && ball.x >= paddles.player1.x && ballHitsPaddle(paddles.player1))
      ball.dx *= -1;
    else if (ball.dx > 0 && ball.x + ball.size >= paddles.player2.x && ball.x + ball.size <= paddles.player2.x + paddles.player2.width && ballHitsPaddle(paddles.player2))
      ball.dx *= -1;
    paddles.player1.y = Math.max(0, Math.min(332, paddles.player1.y));
    paddles.player2.y = Math.max(0, Math.min(332, paddles.player2.y));
        if (ball.x <= 0) {
      score.player2 += 1;
    if (score.player2 >= endScore) {
      this.state.isGameOver = true;
      const row = getUserById(this.player2);
      this.state.winner = row?.username || 'Player 2';
      recordGameResult(this.player2, this.player1);
      setTimeout(() => this.fullReset(), 3000);
      return;
    }

    this.state.waitingForStart = true;
    this.state.countdown = 3;
    const countdownInterval = setInterval(() => {
      this.state.countdown--;
      if (this.state.countdown <= 0) {
        clearInterval(countdownInterval);
        this.state.waitingForStart = false;
        this.state.countdown = null;
        this.resetBall('right');
      }
    }, 1000);

    return;
  }

  if (ball.x + ball.size >= 768) {
    score.player1 += 1;

    if (score.player1 >= endScore) {
      this.state.isGameOver = true;
      const row = getUserById(this.player1);
      this.state.winner = row?.username || 'Player 1';
      recordGameResult(this.player1, this.player2);
      setTimeout(() => this.fullReset(), 3000);
      return;
    }

    this.state.waitingForStart = true;
    this.state.countdown = 3;
    const countdownInterval = setInterval(() => {
      this.state.countdown--;
      if (this.state.countdown <= 0) {
        clearInterval(countdownInterval);
        this.state.waitingForStart = false;
        this.state.countdown = null;
        this.resetBall('left');
      }
    }, 1000);

    return;
  }


  }

  fullReset() {
    this.player1 = null;
    this.player2 = null;
    this.players.clear();
    this.state = this.initState();
    this.state.waitingForStart = true;
    this.state.countdown = null;
  }

  isPlayer1(userId) {
    return [...this.players.keys()][0] === userId;
  }

  resetBall(direction = 'right') {
    const ball = this.state.ball;
    const angle = (Math.random() * Math.PI / 3) - (Math.PI / 6);
    const speed = ball.speed;
    const dir = direction === 'left' ? -1 : 1;

    ball.x = 384;
    ball.y = 216;
    ball.dx = Math.cos(angle) * speed * dir;
    ball.dy = Math.sin(angle) * speed;
  }
}

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({
      server,
      path: '/ws'
    });

    this.clients = new Map();
    this.games = new Map();
    this.gameSessions = new Map();
    this.gamePlayers = new Map();
    this.onlineUsers = new Map();

    this.setupWebSocket();
  }



setupWebSocket() {
  this.wss.on('connection', (ws, req) => {
    const clientId = this.generateClientId();
    this.clients.set(clientId, ws);
    ws.isAlive = true;
    ws.send(
      JSON.stringify({
        type: 'connection',
        clientId,
        message: 'Connected to secure WebSocket server'
      })
    );

    if (!req.url) return;
    const url = new URL(req.url, `http://${req.headers.host}`); 
    const sessionId = url.searchParams.get('sessionId') || '';
    const playerId = url.searchParams.get('playerId') || '';
    let session = null;
    if (this.gameSessions.has(sessionId)) {
      session = this.gameSessions.get(sessionId);
    } else {

      session = new GameSession(sessionId);
      this.gameSessions.set(sessionId, session);
    }
    let player1Name = 'Player 1';
    let player2Name = 'Player 2';
    if (session.player1) {
      const row1 = getUserById(session.player1);
      if (row1?.username) player1Name = row1.username;
    }
    if (session.player2) {
      const row2 = getUserById(session.player2);
      if (row2?.username) player2Name = row2.username;
    }

    const initialState = {
      ball: session.state.ball,
      paddles: session.state.paddles,
      player1Name,
      player2Name,
      score: session.state.score,
      isGameOver: session.state.isGameOver,
      winner: session.state.winner,
      waitingForStart: true,   
      countdown: null         
    };

    ws.send(
      JSON.stringify({
        type: 'state',
        payload: initialState
      })
    );

    ws.on('message', (rawMessage) => {
      try {
        const data = JSON.parse(rawMessage);
        this.handleMessage(clientId, data);
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      }
    });

    ws.on('close', () => {
    });

    ws.on('pong', () => {
      ws.isAlive = true;
    });
  });

setInterval(() => {
    for (const [sessionId, session] of this.gameSessions.entries()) {
      session.update();

      for (const userId of session.players.keys()) {
        const ws = this.onlineUsers.get(userId);

        if (!ws) {
          console.warn(`[WARN] No socket for user ${userId}`);
          continue;
        }
        if (ws.readyState !== WebSocket.OPEN) {
          console.warn(`[WARN] Socket not open for user ${userId}`);
          this.onlineUsers.delete(userId);
          continue;
        }

        try {
          let player1Name = 'Player 1';
          let player2Name = 'Player 2';

          if (session.player1) {
            const row1 = getUserById(session.player1);
            if (row1?.username) player1Name = row1.username;
          }
          if (session.player2) {
            const row2 = getUserById(session.player2);
            if (row2?.username) player2Name = row2.username;
          }

          const fullState = {
            ball:            session.state.ball,
            paddles:         session.state.paddles,
            score:           session.state.score,
            isGameOver:      session.state.isGameOver,
            winner:          session.state.winner,
            waitingForStart: session.state.waitingForStart,
            countdown:       session.state.countdown,
            isPaused:        session.state.isPaused,    
            player1Name,    
            player2Name    
          };
        if (session.state.isPaused) {
            ws.send(JSON.stringify({ type: 'draw' }));
          } else {
            ws.send(JSON.stringify({ type: 'state', payload: fullState }));
          }
        } catch (err) {
          console.error(`[ERROR] Failed to send to user ${userId}:`, err);
        }
      }
    }
  }, 1000 / 60);
}


  broadcastUserStatus(userId, status) {
    const message = JSON.stringify({
      type: 'user-status',
      payload: { userId, status }
    });

    for (const ws of this.clients.values()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
  }

  generateClientId() {
    return Math.random().toString(36).substr(2, 9);
  }

  handleMessage(clientId, data) {
    switch (data.type) {
      case 'chat':
        this.handleChatMessage(clientId, data.payload);
        break;
      case 'auth':
        this.handleAuth(clientId, data.payload);
        break;
      case 'dm':
        this.handleDirectMessage(clientId, data.payload);
        break;
      case 'game':
        this.handleGameMessage(clientId, data.payload)
        break;
      default:
        this.sendToClient(clientId, {
          type: 'error',
          message: `Unknown message type: ${data.type}`
        });
    }
  }

  handleAuth(clientId, payload) {
  const token = payload?.token;
  if (!token) {
    return this.sendToClient(clientId, {
      type: 'error',
      message: 'Missing token'
    });
  }

  let userId;
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch (err) {
    return this.sendToClient(clientId, {
      type: 'error',
      message: 'Invalid token'
    });
  }

  const ws = this.clients.get(clientId);
  if (!ws) {
    return this.sendToClient(clientId, {
      type: 'error',
      message: 'WebSocket client not found'
    });
  }

  ws.userId = userId;
  ws.clientId = clientId;
  this.onlineUsers.set(userId, ws);
  this.clients.set(clientId, ws);

  this.sendToClient(clientId, {
    type: 'auth-success',
    userId
  });

  this.broadcastUserStatus(userId, 'online');
}

  handleGameMessage(clientId, payload) {
    const { action, direction, playerId, sessionId } = payload;
    if (!playerId || !sessionId) return;

    for (const [otherSessionId, otherSession] of this.gameSessions.entries()) {
      if (otherSessionId !== sessionId && otherSession.players.has(playerId)) {
        otherSession.players.delete(playerId);
        if (otherSession.player1 === playerId) otherSession.player1 = null;
        if (otherSession.player2 === playerId) otherSession.player2 = null;
      }
    }

    if (!this.gameSessions.has(sessionId)) {
      this.gameSessions.set(sessionId, new GameSession(sessionId));
    }

    const session = this.gameSessions.get(sessionId);
    if (!session.players.has(playerId)) {
      session.players.set(playerId, null);
      if (!session.player1) session.player1 = playerId;
      else if (!session.player2 && session.player1 !== playerId) session.player2 = playerId;
    }

    if (session.player1 && session.player2 && session.state.waitingForStart) {
      for (const userId of session.players.keys()) {
        const ws = this.onlineUsers.get(userId);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'state',
            payload: session.state
          }));
        }
      }
    }

    if (action === 'input') {
      session.players.set(playerId, direction);
    }

    if (action === 'pause') {
      session.state.isPaused = !session.state.isPaused;
      for (const userId of session.players.keys()) {
        const ws = this.onlineUsers.get(userId);
        if (ws && ws.readyState === WebSocket.OPEN) {
          const fullState = {
            ...session.state,
            player1Name: getUserById(session.player1)?.username || 'Player 1',
            player2Name: getUserById(session.player2)?.username || 'Player 2'
          };

          ws.send(JSON.stringify({
            type: 'state',
            payload: fullState
          }));
        }
      }
    }

    if (action === 'start' && session.state.waitingForStart && !session.state.countdown) {
      session.state.countdown = 3;

      const countdownInterval = setInterval(() => {
        session.state.countdown--;

        if (session.state.countdown <= 0) {
          clearInterval(countdownInterval);
          session.state.waitingForStart = false;
          session.state.countdown = null;
          session.resetBall(Math.random() > 0.5 ? 'left' : 'right');
        }
      }, 1000);
    }
  }

  handleChatMessage(clientId, payload) {
    if (!payload || typeof payload.text !== 'string' || !payload.text.trim()) {
      return this.sendToClient(clientId, {
        type: 'error',
        message: 'Invalid chat message'
      });
    }

    const chatMessage = {
      type: 'chat',
      clientId,
      timestamp: Date.now(),
      data: {
        text: payload.text.trim()
      }
    };
    this.broadcast(chatMessage);
  }

  handleDirectMessage(clientId, payload) {

    const { toUserId, text } = payload || {};
    const fromWs = this.clients.get(clientId);
    const fromUserId = fromWs?.userId;

    if (!fromUserId || !toUserId || !text?.trim()) {
      return;
    }

    if (isBlocked(fromUserId, toUserId)) {
      fromWs?.send(JSON.stringify({
        type: 'error',
        message: 'You are blocked or have blocked this user.'
      }));
      return;
    }

    const toWs = this.onlineUsers.get(toUserId);
    const payloadToSend = {
      type: 'dm',
      senderId: fromUserId,
      text: text.trim(),
      timestamp: Date.now()
    };

    if (toWs?.readyState === WebSocket.OPEN) {
      toWs.send(JSON.stringify(payloadToSend));
    }

    if (fromWs?.readyState === WebSocket.OPEN) {
      fromWs.send(JSON.stringify(payloadToSend));
    }
  }

  
  broadcast(message) {
    const msg = JSON.stringify(message);
    for (const ws of this.clients.values()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    }
  }
  
  sendToClient(clientId, message) {
    const ws = this.clients.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}

function isBlocked(senderId, receiverId) {
  const stmt = db.prepare(`
    SELECT 1 FROM blocks 
    WHERE (blocker_id = ? AND blocked_id = ?) 
      OR (blocker_id = ? AND blocked_id = ?)
  `);
  const result = stmt.get(senderId, receiverId, receiverId, senderId);
  return !!result;
}

function recordGameResult(winnerId, loserId) {
  const stmt = db.prepare(`
    INSERT INTO game_results (winner_id, loser_id)
    VALUES (?, ?)
  `);
  console.log(`[DB] Recorded game result: winner=${winnerId}, loser=${loserId}`);
  stmt.run(winnerId, loserId);
}

module.exports = WebSocketService;
