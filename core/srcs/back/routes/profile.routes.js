const { db } = require('../db');
const JWTAuthentication = require('../middleware/jwt/jwt.auth');
const SanitizeService = require('../middleware/security.middleware');

async function profileRoutes(fastify, options) {
    fastify.get('/history', {
        preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
        handler: async (request, reply) => {
            try {
                const userId = request.user.id;

                const rows = db.prepare(`
                    SELECT
                        match_id,
                        user_id,
                        opponent,
                        result,
                        score_user,
                        score_opponent,
                        played_at
                    FROM match_history
                    WHERE user_id = ?
                    ORDER BY played_at DESC
                `).all(userId);

                return reply.send(rows);
            } catch (err) {
                request.log.error(err);
                return reply.code(500).send({ error: 'Failed to load match history.' });
            }
        }
    });

    fastify.get('/users/:id/history', {
        preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
        handler: async (request, reply) => {
            try {
                const friendId = Number(request.params.id);

                if (isNaN(friendId)) {
                    return reply.code(400).send({ error: 'Invalid user ID' });
                }

                const rows = db.prepare(`
                    SELECT
                        match_id,
                        user_id,
                        opponent,
                        result,
                        score_user,
                        score_opponent,
                        played_at
                    FROM match_history
                    WHERE user_id = ?
                    ORDER BY played_at DESC
                `).all(friendId);

                return reply.send(rows);
            } catch (err) {
                request.log.error(err);
                return reply.code(500).send({ error: 'Failed to load match history for user.' });
            }
        }
    });

    fastify.get('/users/:id', {
        preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
        handler: async (request, reply) => {
            const friendId = parseInt(request.params.id, 10);
    
            const user = db.prepare(`
                SELECT id, username, avatar
                FROM users
                WHERE id = ?
            `).get(friendId);
    
            if (!user) {
                return reply.code(404).send({ error: 'Utilisateur non trouvé' });
            }
    
            return {
                id: user.id,
                username: user.username,
                avatar: user.avatar || 'default.png'
            };
        }
    });

    fastify.get('/users/:id/stats', {
        preHandler: [JWTAuthentication.verifyJWTToken],
        handler: async (request, reply) => {
            const userId = request.params.id;

            try {
                const row = db.prepare('SELECT wins, losses FROM users WHERE id = ?').get(userId);

                if (!row) {
                    return reply.code(404).send({ error: 'Utilisateur non trouvé' });
                }

                return { wins: row.wins, losses: row.losses };
            } catch (err) {
                console.error('Erreur chargement stats:', err);
                return reply.code(500).send({ error: 'Erreur interne du serveur' });
            }
        }
    });
}

module.exports = profileRoutes;