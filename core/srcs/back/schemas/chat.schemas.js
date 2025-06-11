const chatSchema = {
	sendMessage: {
		body: {
			type: 'object',
			required: ['receiverId', 'content'],
			properties: {
				receiverId: {
					type: 'number'
				},
				content: {
					type: 'string',
					minLength: 1,
					maxLength: 1000
				}
			},
			additionalProperties: false
		}
	}
};

module.exports = chatSchema;
