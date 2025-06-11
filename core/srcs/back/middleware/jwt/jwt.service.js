const jwt = require('jsonwebtoken');

class JWTService {
	static verifyJWTToken(token) {
		try {
			return jwt.verify(token, process.env.JWT_SECRET);
		} catch (error) {
			throw new Error('Invalid token');
		}
	}
}

module.exports = JWTService;