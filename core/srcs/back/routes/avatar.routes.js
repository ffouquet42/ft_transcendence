const path = require('path');
const fs = require('fs');
const util = require('util');
const pump = util.promisify(require('stream').pipeline);
const { db } = require('../db');
const JWTAuthentication = require('../middleware/jwt/jwt.auth');
const SanitizeService = require('../middleware/security.middleware');

async function avatarRoutes(fastify, options) {
	fastify.post('/upload-avatar', {
		preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
		handler: async (request, reply) => {
			try {

				const file = await request.file();
				const userId = request.user.id;

				if (!file || !file.filename) {
					console.warn('[AVATAR] No file provided');
					return reply.code(400).send({ error: 'No file uploaded' });
				}

				const ext = path.extname(file.filename);
				const fileName = `avatar_${userId}${ext}`;
				const filePath = path.join(__dirname, '..', 'public', 'avatars', fileName);


				await pump(file.file, fs.createWriteStream(filePath));

				const relativePath = `/avatars/${fileName}`;
				db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(relativePath, userId);

				return reply.send({ success: true, avatarUrl: relativePath });
			} catch (err) {
				console.error('[AVATAR] Upload error:', err);
				return reply.code(500).send({ error: 'Server error during avatar upload' });
			}
		}
	});
}

module.exports = avatarRoutes;
