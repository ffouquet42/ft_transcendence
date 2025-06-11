const AuthService = require('../services/auth.service');
const jwt = require('jsonwebtoken');
const dbApi = require('../db');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const JWTAuthentication = require('../middleware/jwt/jwt.auth');
const SanitizeService = require('../middleware/security.middleware');
const schemas = require('../schemas/auth.schemas');

async function authRoutes(fastify, options) {

	fastify.get('/me', {
		preHandler: [JWTAuthentication.verifyJWTToken],
		handler: async (req, reply) => {
			try {
				const id = req.user.id;
				const user = dbApi.db.prepare(
					'SELECT id, username, avatar, two_factor_enabled, wins, losses FROM users WHERE id = ?'
				).get(id);

				if (!user) {
					return reply.status(404).send({ error: 'Utilisateur non trouvé' });
				}

				return {
					id: user.id,
					username: user.username,
					avatar: user.avatar || '/avatars/default.png',
					twoFactorEnabled: !!user.two_factor_enabled,
					wins: user.wins,
					losses: user.losses
				};

			} catch (err) {
				console.error('🔥 Erreur dans /auth/me :', err);
				return reply.code(500).send({ error: 'Internal Server Error' });
			}
		}
	});

	fastify.post('/register', {
		preHandler: [SanitizeService.sanitize],
		schema: schemas.register,
		handler: async (request, reply) => {
			try {
				const { username, password } = request.body;
				const userId = await AuthService.registerUser(username, password);

				return reply.code(200).send({
					success: true,
					message: 'User registered successfully',
					userId
				});
			} catch (error) {
				return reply.code(400).send({
					success: false,
					error: error.message
				});
			}
		}
	});

	fastify.post('/login', {
		preHandler: [SanitizeService.sanitize],
		schema: schemas.login,
		handler: async (request, reply) => {
			try {
				const { username, password } = request.body;
				const user = await AuthService.loginUser(username, password);

				if (user.twoFactorEnabled) {
					return reply.code(200).send({
						success: true,
						message: '2FA required',
						twofa: true,
						userId: user.id,
						username: user.username
					});
				}

				const token = jwt.sign(
					{ id: user.id, username: user.username },
					process.env.JWT_SECRET,
					{ expiresIn: process.env.JWT_EXPIRES_IN }
				);

				return reply.code(200).send({
					success: true,
					message: 'Login successful',
					token,
					user: {
						id: user.id,
						username: user.username
					}
				});

			} catch (error) {
				return reply.code(401).send({
					success: false,
					error: error.message
				});
			}
		}
	});

	fastify.put('/update', {
		preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
		schema: schemas.updateUsername,
		handler: async (request, reply) => {
	try {
		const { username, newUsername } = request.body;

				if (!username || !newUsername) {
					return reply.code(400).send({ error: 'Username and new username required' });
				}

				const updatedUser = await AuthService.updateUser(username, newUsername);
				return reply.send({ success: true, user: updatedUser });
			} catch (err) {
				reply.code(400).send({ error: err.message });
			}
		}
	});

	fastify.put('/password', {
		preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
		schema: schemas.updatePassword,
		handler: async (request, reply) => {
			try {
				const { username, newPassword } = request.body;

				if (!newPassword || newPassword.length < 8) {
					return reply.code(400).send({ error: 'New password is too short' });
				}

				await AuthService.updatePassword(username, newPassword);
				return reply.code(200).send({ success: true, message: 'Password updated' });
			} catch (err) {
				return reply.code(500).send({ success: false, error: 'Failed to update password' });
			}
		}
	});

	fastify.post('/2fa/setup', {
		preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
		schema: schemas.setup2FA,
		handler: async (request, reply) => {
			try {
				const user = request.user;
				if (!user?.id) return reply.code(401).send({ error: 'Unauthorized' });

				const row = dbApi.db.prepare('SELECT two_factor_enabled FROM users WHERE id = ?').get(user.id);
				if (row?.two_factor_enabled) {
					return reply.code(400).send({ error: '2FA déjà activée' });
				}

				const secret = speakeasy.generateSecret({
					name: `Transcendence (${user.username})`,
				});

				if (!secret.otpauth_url) throw new Error('Missing otpauth_url');

				dbApi.db.prepare('UPDATE users SET two_factor_secret = ? WHERE id = ?')
					.run(secret.base32, user.id);

				const qrCode = await qrcode.toDataURL(secret.otpauth_url);
				return reply.send({ qrCode });

			} catch (err) {
				return reply.code(500).send({ error: 'Failed to setup 2FA' });
			}
		}
	});

	fastify.post('/2fa/verify', {
		preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
		schema: schemas.verify_setup2FA,
		handler: async (request, reply) => {
			try {
				const { token } = request.body;
				const userId = request.user.id;

				if (!token) {
					return reply.code(400).send({ error: 'Token is required' });
				}

				const row = dbApi.db.prepare('SELECT two_factor_secret FROM users WHERE id = ?').get(userId);
				if (!row || !row.two_factor_secret) {
					return reply.code(400).send({ error: '2FA secret not found' });
				}

				const verified = speakeasy.totp.verify({
					secret: row.two_factor_secret,
					encoding: 'base32',
					token,
					window: 1
				});

				if (!verified) {
					return reply.code(401).send({ error: 'Invalid 2FA token' });
				}

				dbApi.db.prepare('UPDATE users SET two_factor_enabled = 1 WHERE id = ?').run(userId);
				return reply.send({ success: true });
			} catch (err) {
				return reply.code(500).send({ error: 'Internal server error' });
			}
		}
	});

	fastify.post('/2fa/verify-login', {
		preHandler: [SanitizeService.sanitize],
		schema: schemas.verify_login2FA,
		handler: async (request, reply) => {
			try {
				const { userId, token: code } = request.body;

				if (!userId || !code) {
					return reply.code(400).send({ error: 'Missing userId or token' });
				}

				const row = dbApi.db.prepare('SELECT two_factor_secret FROM users WHERE id = ?').get(userId);
				if (!row || !row.two_factor_secret) {
					return reply.code(400).send({ error: '2FA not configured for this user' });
				}

				const verified = speakeasy.totp.verify({
					secret: row.two_factor_secret,
					encoding: 'base32',
					token: code,
					window: 1
				});

				if (!verified) {
					return reply.code(401).send({ error: 'Invalid 2FA token' });
				}

				const token = jwt.sign(
					{ id: userId },
					process.env.JWT_SECRET,
					{ expiresIn: process.env.JWT_EXPIRES_IN }
				);

				const user = dbApi.db.prepare('SELECT username FROM users WHERE id = ?').get(userId);

				return reply.send({
					success: true,
					token,
					user: {
						id: userId,
						username: user.username
					}
				});

			} catch (err) {
				return reply.code(500).send({ error: 'Internal server error' });
			}
		}
	});


	fastify.post('/friends/add', {
		preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
		schema: schemas.addFriend,
		handler: async (req, reply) => {
			const { username } = req.body;
			const userId = req.user.id;

			if (!username) {
				return reply.code(400).send({ error: 'Username is required' });
			}

			if (!/^[a-zA-Z0-9_]+$/.test(username)) {
				return reply.code(400).send({ error: 'Username can only contain letters, numbers, and underscores' });
			}

			if (/<[^>]*>/.test(username)) {
				return reply.code(400).send({ error: 'Username cannot contain HTML tags' });
			}

			if (/on\w+\s*=/.test(username.toLowerCase())) {
				return reply.code(400).send({ error: 'Username contains invalid characters' });
			}

			const friend = dbApi.db.prepare('SELECT id FROM users WHERE username = ?').get(username);
			if (!friend) {
				return reply.code(404).send({ error: 'User not found' });
			}

			if (friend.id === userId) {
				return reply.code(400).send({ error: 'Cannot add yourself as a friend' });
			}

			const exists = dbApi.db.prepare(`
				SELECT 1 FROM friends
				WHERE user_id = ? AND friend_id = ?
			`).get(userId, friend.id);

			if (exists) {
				return reply.code(400).send({ error: 'Friend already added' });
			}

			dbApi.db.prepare(`
				INSERT INTO friends (user_id, friend_id, status)
				VALUES (?, ?, 'accepted')
			`).run(userId, friend.id);

			return reply.send({ success: true, message: 'Friend added successfully' });
		}
	});

	fastify.get('/friends', {
		preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
		handler: async (request, reply) => {
			try {
				const userId = request.user.id;

				const rows = dbApi.db.prepare(`
					SELECT u.id, u.username,
						   CASE
							 WHEN u.avatar IS NOT NULL AND u.avatar != ''
							 THEN '/avatars/' || u.avatar
							 ELSE '/avatars/default.png'
						   END AS avatar
					FROM friends f
					JOIN users u ON u.id = f.friend_id
					WHERE f.user_id = ?
				`).all(userId);

				return reply.send(rows);
			} catch (err) {
				return reply.code(500).send({ error: 'Failed to fetch friends' });
			}
		}
	});

	fastify.get('/blocked', { 
		preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
		handler: async (request, reply) => {
			const blockerId = request.user.id;
			const rows = dbApi.db
				.prepare('SELECT blocked_id FROM blocks WHERE blocker_id = ?')
				.all(blockerId);
			const blockedIds = rows.map(r => r.blocked_id);
			return reply.code(200).send(blockedIds);
		}
	});

	fastify.post('/block',  { 
		preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
		schema: schemas.blockUser,
		handler: async (request, reply) => {
			const blockerId = request.user.id;
			const { blockedId } = request.body;
			if (!blockedId) return reply.code(400).send({ error: 'blockedId required' });
			try {
				dbApi.db
					.prepare('INSERT OR IGNORE INTO blocks (blocker_id, blocked_id) VALUES (?, ?)')
					.run(blockerId, blockedId);
				return reply.code(201).send({ message: 'User blocked successfully' });
			} catch (err) {
				console.error(err);
				return reply.code(500).send({ error: 'Internal server error' });
			}
		}
	});

	fastify.post('/unblock', { 
		preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
		schema: schemas.unblockUser,
		handler: async (request, reply) => {
			const currentUserId = request.user.id;
			const { unblockId } = request.body;
			if (!unblockId) return reply.code(400).send({ error: 'unblockId required' });
			try {
				const result = dbApi.db
					.prepare('DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?')
					.run(currentUserId, unblockId);
				if (result.changes === 0) {
					return reply.code(404).send({ message: 'No blocking relationship found' });
				}
				return reply.code(200).send({ message: 'User unblocked successfully' });
			} catch (err) {
				console.error(err);
				return reply.code(500).send({ error: 'Internal server error' });
			}
		}
	});

	fastify.delete('/friends/remove', {
		preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
		schema: schemas.removeFriend,
		handler: async (req, reply) => {
			const { friendId } = req.body;
			const userId = req.user.id;

			if (!friendId) {
				return reply.code(400).send({ error: 'friendId is required' });
			}

			const result = dbApi.db.prepare(`
				DELETE FROM friends WHERE user_id = ? AND friend_id = ?
			`).run(userId, friendId);

			return reply.send({ success: true, removed: result.changes > 0 });
		}
	});

}

module.exports = authRoutes;
