# Use Node.js 18 LTS
FROM node:18-slim

# Install SQLite3, Python, build tools, and OpenSSL
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y sqlite3 python3 make g++ curl openssl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend files
COPY . .

# Expose Fastify port
EXPOSE 3000


# Use the entrypoint script
CMD ["npm", "run", "dev"]
