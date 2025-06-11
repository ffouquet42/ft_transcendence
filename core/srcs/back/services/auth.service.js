const bcrypt = require('bcrypt');
const { db } = require('../db');

class AuthService {
    static validateUserInput(username, password) {
        const errors = [];
        
        if (!username || username.length < 3 || username.length > 20) {
            errors.push('Username must be between 3 and 20 characters');
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            errors.push('Username can only contain letters, numbers, and underscores');
        }
        if (/<[^>]*>/.test(username)) {
            errors.push('Username cannot contain HTML tags');
        }
        if (/javascript:|data:|vbscript:|on\w+\s*=/.test(username.toLowerCase())) {
            errors.push('Username contains invalid characters');
        }

        if (!password || password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
        }

        return errors;
    }

    static async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    static async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    static async registerUser(username, password) {
        try {
            const errors = this.validateUserInput(username, password);
            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }

            const hashedPassword = await this.hashPassword(password);
            
            const stmt = db.prepare(`
                INSERT INTO users (username, password_hash)
                VALUES (?, ?)
            `);
            
            const result = stmt.run(username, hashedPassword);
            return result.lastInsertRowid;
        } catch (error) {
            if (
                error.code === 'SQLITE_CONSTRAINT' || 
                error.message.includes('UNIQUE constraint failed: users.username')
            ) {
                throw new Error('Username already exists');
            }
            throw error;
        }
    }

    static async loginUser(username, password) {
        try {
            if (!username || !password) {
                throw new Error('Username and password are required');
            }

            const stmt = db.prepare(`
                SELECT id, username, password_hash, two_factor_enabled
                FROM users
                WHERE username = ?
            `);
            const user = stmt.get(username);

            if (!user) {
                throw new Error('User not found');
            }

            const isValid = await this.verifyPassword(password, user.password_hash);

            if (!isValid) {
                throw new Error('Invalid password');
            }

            return {
                id: user.id,
                username: user.username,
                twoFactorEnabled: !!user.two_factor_enabled
            };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static async updateUser(currentUsername, newUsername) {
        if (!newUsername || newUsername.length < 3 || newUsername.length > 20) {
            throw new Error('New username must be between 3 and 20 characters');
        }

        const stmt = db.prepare(`UPDATE users SET username = ? WHERE username = ?`);
        const result = stmt.run(newUsername, currentUsername);

        if (result.changes === 0) {
            throw new Error('User not found or username unchanged');
        }

        return { username: newUsername };
    }

    static async updatePassword(username, newPassword) {
        const hashed = await this.hashPassword(newPassword);
        const stmt = db.prepare(`UPDATE users SET password_hash = ? WHERE username = ?`);
        stmt.run(hashed, username);
    }
}

module.exports = AuthService;