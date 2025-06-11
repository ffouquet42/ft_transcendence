const xss = require('xss');

class SanitizeService {
	static xssProtection(request, reply) {
		const processObject = (obj) => {
			for (let key in obj) {
				if (typeof obj[key] === 'string') {
					obj[key] = xss(obj[key].trim(), {
						whiteList: {}, 
						stripIgnoreTag: true,
						stripIgnoreTagBody: ['script'],
						css: false, 
						allowCommentTag: false, 
						allowList: {
							a: ['href'],
							img: ['src', 'alt'],
						}
					});

					if (key === 'username') {
						obj[key] = obj[key].replace(/<[^>]*>/g, '');
						obj[key] = obj[key].replace(/on\w+\s*=|\b(javascript|data|vbscript):/gi, '');
						obj[key] = obj[key].replace(/[<>'"]/g, '');
						obj[key] = obj[key].replace(/[^a-zA-Z0-9_]/g, '');
					}

					obj[key] = obj[key]
						.replace(/javascript:|data:|vbscript:|on\w+\s*=/gi, '') 
						.replace(/<[^>]*>/g, '') 
						.replace(/[<>'"]/g, ''); 
				} else if (typeof obj[key] === 'object' && obj[key] !== null) {
					processObject(obj[key]);
				}
			}
		};
		
		try {
			if (request.body) processObject(request.body);
			if (request.query) processObject(request.query);
			if (request.params) processObject(request.params);
		} catch (error) {
			console.error('[XSS PROTECTION]', error.message);
			throw error;
		}
	}

	static sqlInjectionProtection(request, reply) {
		const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|DECLARE)\b.*\b(FROM|INTO|WHERE|VALUES|TABLE|DATABASE)\b)|(--)|(;)|(\/\*.*\*\/)/i;
		
		const checkForSQLInjection = (obj) => {
			for (let key in obj) {
				if (typeof obj[key] === 'string' && sqlInjectionPattern.test(obj[key])) {
					throw new Error(`Potential SQL injection detected in ${key}`);
				} else if (typeof obj[key] === 'object' && obj[key] !== null) {
					checkForSQLInjection(obj[key]);
				}
			}
		};

		try {
			if (request.body) checkForSQLInjection(request.body);
			if (request.query) checkForSQLInjection(request.query);
			if (request.params) checkForSQLInjection(request.params);
		} catch (error) {
			console.error('[SQL INJECTION PROTECTION]', error.message);
			throw error;
		}
	}

	static async sanitize(request, reply) {
		try {
			SanitizeService.xssProtection(request, reply);
			SanitizeService.sqlInjectionProtection(request, reply);
		} catch (error) {
			console.error('[SECURITY] Error in middleware:', error);
			return reply.code(400).send({ 
				success: false,
				message: error.message.includes('SQL') ? 
					'The request contains potentially harmful content SQL' :
					'The request contains potentially harmful content xss'
			});
		}
	}
}

module.exports = SanitizeService;
