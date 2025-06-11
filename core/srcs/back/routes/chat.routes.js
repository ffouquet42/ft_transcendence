const { db } = require('../db');
const JWTAuthentication = require('../middleware/jwt/jwt.auth');
const SanitizeService = require('../middleware/security.middleware');
const schemas = require('../schemas/chat.schemas');

async function chatRoutes(fastify, options) {
	fastify.post('/message', {
		preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
		schema: schemas.sendMessage,
		handler: async (request, reply) => {
			const { receiverId, content } = request.body;
			const senderId = request.user.id;

			if (!receiverId || !content) {
				return reply.code(400).send({ error: 'receiverId and content are required' });
			}

			db.prepare('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)')
				.run(senderId, receiverId, content);

			return reply.send({ success: true });
		}
	});

	fastify.get('/messages/:userId', {
		preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
		handler: async (request, reply) => {
			const senderId = request.user.id;
			const receiverId = parseInt(request.params.userId, 10);
	
			const messages = db.prepare(`
				SELECT
					m.id,
					m.sender_id,
					m.receiver_id,
					m.content,
					m.timestamp,
					u.username AS sender_username
				FROM messages m
				JOIN users u ON m.sender_id = u.id
				WHERE (m.sender_id = ? AND m.receiver_id = ?)
					OR (m.sender_id = ? AND m.receiver_id = ?)
				ORDER BY m.timestamp ASC
			`).all(senderId, receiverId, receiverId, senderId);
	
			return reply.send(messages);
		}
	});
}

module.exports = chatRoutes;