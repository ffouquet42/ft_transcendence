# ft_transcendence

*Version: 16.1*

## Grade - 100/100

Mandaroty Part : 100/100  

## Description

The final project of the 42 Common Core.  
Its goal is to confront students with a large-scale project involving technologies and concepts that may be unfamiliar, in order to evaluate adaptability, autonomy, and problem-solving skills.

The project consists in developing a web-based multiplayer Pong platform, with real-time gameplay, user management, security constraints, and containerized deployment.

## Overview

The application provides a Single Page Application (SPA) allowing users to play Pong directly in their browser.

The mandatory part focuses on:
- A functional Pong game playable by multiple users
- A clean and usable web interface
- Respect of strict technical and security constraints
- Full containerization using Docker

In addition to the mandatory requirements, the project offers a large set of optional modules (web frameworks, multiplayer features, AI, cybersecurity, DevOps, graphics, accessibility, etc.), allowing teams to customize the project while respecting imposed technologies.

The primary objective is not to build a portfolio-ready product, but to demonstrate the ability to:
- Learn new technologies quickly
- Design and organize a complex system
- Make technical and architectural decisions
- Deliver a functional and secure application

## Technical Constraints (Mandatory)

- Single Page Application (SPA)
- Frontend written in TypeScript
- Compatibility with the latest stable version of Mozilla Firefox
- Dockerized application, runnable with a single command
- No unhandled errors or warnings during navigation
- Security best practices:
  - Hashed passwords
  - Protection against SQL injection and XSS
  - HTTPS / secure WebSocket usage if applicable
  - Proper input validation
- Sensitive data stored in a local `.env` file and excluded from version control

## Game

- Real-time Pong game playable on the website
- Matchmaking and tournament system
- Equal gameplay rules for all players (same paddle speed, same constraints)
- Tournament flow with clear indication of current and upcoming matches
- Respect of the original Pong spirit (1972), regardless of visual style

## Configuration (.env)

Before launch the project, create a `.env` file at the root with following content:

```env
PORT=3000
HOST=0.0.0.0
JWT_SECRET=your_jwt_secret_here
DB_PATH=/data/database.sqlite
SSL_KEY_PATH=/usr/src/app/certs/key.pem
SSL_CERT_PATH=/usr/src/app/certs/cert.pem
FRONTEND_URL=https://localhost:5173/
WS_URL=wss://localhost:3000
```

## Testing

The application was manually tested to ensure:
- Functional gameplay
- Proper user flow
- No runtime errors or warnings
- Compliance with security requirements defined in the subject

## Credits

Project made by npetipi (Security and Protection) & mfroissa (Pong Game Design) & mfeldman (Server Development) & [ffouquet42](https://github.com/ffouquet42) (UI and Visual Design)