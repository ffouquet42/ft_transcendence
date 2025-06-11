const authSchema = {
  register: {
	  body: {
		  type: 'object',
		  required: ['username', 'password'],
		  properties: {
			  username: {
				  type: 'string',
				  minLength: 3,
				  maxLength: 20,
				  pattern: '^[a-zA-Z0-9_-]+$'
			  },
			  password: {
				  type: 'string',
				  minLength: 8,
				  maxLength: 100,
				  pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?])[A-Za-z\\d!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?]{8,}$'
			  }
		  },
		  additionalProperties: false
	  }
  },
  login: {
	  body: {
		  type: 'object',
		  required: ['username', 'password'],
		  properties: {
			  username: {
				  type: 'string',
				  minLength: 3,
				  maxLength: 20,
				  pattern: '^[a-zA-Z0-9_-]+$'
			  },
			  password: {
				  type: 'string',
				  minLength: 8,
				  maxLength: 100,
				  pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?])[A-Za-z\\d!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?]{8,}$'
			  }
		  },
		  additionalProperties: false
	  }
  },
  updateUsername: {
  body: {
	type: 'object',
	required: ['username', 'newUsername'], 
	properties: {
	  username: { 
		type: 'string',
		minLength: 3,
		maxLength: 20,
		pattern: '^[a-zA-Z0-9_-]+$'
	  },
	  newUsername: {
		type: 'string',
		minLength: 3,
		maxLength: 20,
		pattern: '^[a-zA-Z0-9_-]+$'
	  }
	},
	additionalProperties: false
  }
  },
updatePassword: {
	body: {
		type: 'object', 
		required: ['newPassword'],
		properties: {
			newPassword: {
				type: 'string',
				minLength: 8,
				maxLength: 100,
				pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?])[A-Za-z\\d!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?]{8,}$'
			}
		},
		additionalProperties: false
	}
},
  setup2FA: {
	body: {
		type: 'object',
		required: [],
		properties: {}
	}
},
verify_setup2FA: {
	body: {
		type: 'object',
		required: ['token'],
		properties: {
			token: { type: 'string', minLength: 6, maxLength: 6 }
		}
	}
},
verify_login2FA: {
	body: {
		type: 'object',
		required: ['token'],
		properties: {
			token: { type: 'string', minLength: 6, maxLength: 6 }
		}
	}
},
disable2FA: {
	body: {
		type: 'object',
		required: [],
		properties: {}
	}
},
addFriend: {
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
	  }
  }   
},
blockUser: {
  body: {
	  type: 'object',
	  required: ['blockedId'],
	  properties: {
		  blockedId: {
			  type: 'number'
		  }
	  },
	  additionalProperties: false
  }
},
unblockUser: {
  body: {
	  type: 'object',
	  required: ['unblockId'],
	  properties: {
		  unblockId: {
			  type: 'number'
		  }
	  },
	  additionalProperties: false
  }
},
removeFriend: {
  body: {
	  type: 'object',
	  required: ['friendId'],
	  properties: {
		  friendId: {
			  type: 'number'
		  }
	  },
	  additionalProperties: false
  }
}
};

module.exports = authSchema; 