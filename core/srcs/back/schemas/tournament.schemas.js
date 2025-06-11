const tournamentSchema = {
	recordGameResult: {
		body: {
			type: 'object',
			required: ['winnerId', 'loserId'],
			properties: {
				winnerId: {
					type: 'number'
				},
				loserId: {
					type: 'number'
				}
			},
			additionalProperties: false
		}
	},
	recordMatchHistory: {
		body: {
			type: 'object',
			required: ['userId', 'opponent', 'result', 'scoreUser', 'scoreOpponent'],
			properties: {
				userId: {
					type: 'number'
				},
				opponent: {
					type: 'string',
					minLength: 3,
					maxLength: 20,
					pattern: '^[a-zA-Z0-9_-]+$'
				},
				result: {
					type: 'string',
					enum: ['win', 'loss']
				},
				scoreUser: {
					type: 'number'
				},
				scoreOpponent: {
					type: 'number'
				}
			},
			additionalProperties: false
		}
	},
	validateUsername: {
		body: {
			type: 'object',
			required: ['username'],
			properties: {
				username: {
					type: 'string',
					minLength: 3,
					maxLength: 20,
					pattern: '^[a-zA-Z0-9_-]+$'
				}
			},
			additionalProperties: false
		}
	}
};

module.exports = tournamentSchema;
