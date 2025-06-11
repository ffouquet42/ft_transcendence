# Use Node.js 18
FROM node:18-slim

# Install system dependencies
RUN apt-get update -y && apt-get upgrade -y

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./

RUN npm install

# Copy all project files into the container
COPY . .

# Expose the port (Vite dev server runs on port 5173)
EXPOSE 5173

# Start the Vite dev server
CMD ["npm", "run", "dev"]
