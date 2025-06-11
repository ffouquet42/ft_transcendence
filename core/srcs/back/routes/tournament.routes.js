const { getUserByUsernameforMat, recordGameResultTournament, recordMatchHistory } = require('../db');
const JWTAuthentication = require('../middleware/jwt/jwt.auth');
const SanitizeService = require('../middleware/security.middleware');

async function tournamentRoutes(fastify, options) {
	fastify.post('/game-result', {
		preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
		handler: async (request, reply) => {
			const { winnerId, loserId } = request.body;

			if (typeof winnerId !== 'number' || typeof loserId !== 'number') {
				return reply.code(400).send({ success: false, message: 'Invalid IDs' });
			}

			try {
				recordGameResultTournament(winnerId, loserId);
				return reply.send({ success: true });
			} catch (err) {
				console.error('[❌ DB] Failed to record game result:', err);
				return reply.code(500).send({ success: false, message: 'DB error' });
			}
		}
	});
	fastify.post('/match-history', {
		preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
		handler: async (request, reply) => {
			const { userId, opponent, result, scoreUser, scoreOpponent } = request.body;

			if (
				typeof userId !== 'number' ||
				typeof opponent !== 'string' ||
				!['win', 'loss'].includes(result) ||
				typeof scoreUser !== 'number' ||
				typeof scoreOpponent !== 'number'
			) {
				return reply.code(400).send({ success: false, message: 'Invalid match history data' });
			}

			try {
			 recordMatchHistory({
	userId, opponent, result, scoreUser, scoreOpponent, playedAt: new Date().toISOString()
});

				return reply.send({ success: true });
			} catch (err) {
				console.error('[❌ DB] Failed to record match history:', err);
				return reply.code(500).send({ success: false, message: 'DB error' });
			}
		}
	});
	fastify.post('/validate-username', {
		preHandler: [JWTAuthentication.verifyJWTToken, SanitizeService.sanitize],
		handler: async (request, reply) => {
			const username = (request.body.username || '').trim();

			if (!username || typeof username !== 'string') {
				return reply.code(400).send({ valid: false, message: 'Username is required' });
			}

			try {
				const user = getUserByUsernameforMat(username);

				if (user) {
					return reply.send({
						valid: true,
						id: user.id,
						avatar: user.avatar || null, 
						wins: user.wins,
						losses: user.losses
					});
				} else {
					return reply.send({ valid: false, message: 'Username not found' });
				}
			} catch (err) {
				console.error('[Validate Username Error]', err);
				return reply.code(500).send({ valid: false, message: 'Internal server error' });
			}
		}
	});
}

module.exports = tournamentRoutes;