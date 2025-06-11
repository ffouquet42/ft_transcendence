const JWTService = require('./jwt.service');

class JWTAuthentication {
	static async verifyJWTToken(request, reply) {
	try {
		const token = request.headers.authorization?.split(' ')[1];
		if (!token) {
			return reply.code(401).send({
				success: false,
				message: 'Authentication failed'
			});
		}
		const decoded = JWTService.verifyJWTToken(token);
		request.user = decoded;
	} catch (error) {
		return reply.code(401).send({
			success: false,
			message: 'Authentication failed'
		});
	}
}

}

module.exports = JWTAuthentication;