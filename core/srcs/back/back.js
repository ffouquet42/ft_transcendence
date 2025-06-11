require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fastifyModule = require('fastify');
const WebSocketService = require('./services/websocket.service');
const fastifyMultipart = require('@fastify/multipart');
const fastifyStatic = require('@fastify/static');
const fastifyCors = require('@fastify/cors');
const authRoutes = require('./routes/auth.routes');
const avatarRoutes = require('./routes/avatar.routes');
const chatRoutes = require('./routes/chat.routes');
const profileRoutes = require('./routes/profile.routes');
const tournamentRoutes = require('./routes/tournament.routes');

const fastify = fastifyModule({
	logger: true,
	https: {
		key: fs.readFileSync(path.join(__dirname, 'certs/key.pem')),
		cert: fs.readFileSync(path.join(__dirname, 'certs/cert.pem')),
	},
});

// Plugins
fastify.register(fastifyStatic, {
	root: path.join(__dirname, 'public', 'avatars'),
	prefix: '/avatars/',
	decorateReply: false
});

fastify.register(fastifyMultipart);
fastify.register(fastifyCors, {
	origin: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true
});

// Routes
fastify.register(authRoutes, { prefix: '/auth' });
fastify.register(avatarRoutes, { prefix: '/auth' });
fastify.register(chatRoutes, { prefix: '/chat' });
fastify.register(profileRoutes, { prefix: '/profile' });
fastify.register(tournamentRoutes, { prefix: '/tournament' });



fastify.get('/health', async (request, reply) => {
	reply.code(200).send({ status: 'ok' });
});

fastify.get('/', async (request, reply) => {
	return { message: 'API is working' };
});

// Launch server
const wsService = new WebSocketService(fastify.server);
fastify.decorate('websocketService', wsService);

// Add security headers middleware
fastify.addHook('onRequest', (request, reply, done) => {
	reply.header('Content-Security-Policy', 
		"default-src 'self'; " +
		"script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
		"style-src 'self' 'unsafe-inline'; " +
		"img-src 'self' data:; " +
		"font-src 'self'; " +
		"object-src 'none'; " +
		"base-uri 'self'; " +
		"form-action 'self'; " +
		"frame-ancestors 'none'; " +
		"block-all-mixed-content; " +
		"upgrade-insecure-requests;"
	);
	reply.header('X-Content-Type-Options', 'nosniff');
	reply.header('X-Frame-Options', 'DENY');
	reply.header('X-XSS-Protection', '1; mode=block');
	reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
	reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
	done();
});

fastify.listen({ port: process.env.PORT, host: process.env.HOST }, (err, address) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
});


