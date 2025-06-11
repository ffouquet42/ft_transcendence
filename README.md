## Configuration (.env)

Avant de lancer le projet, créez un fichier `.env` à la racine avec le contenu suivant :

```env
PORT=3000
HOST=0.0.0.0
JWT_SECRET=your_jwt_secret_here
DB_PATH=/data/database.sqlite
SSL_KEY_PATH=/usr/src/app/certs/key.pem
SSL_CERT_PATH=/usr/src/app/certs/cert.pem
FRONTEND_URL=https://localhost:5173/
WS_URL=wss://localhost:3000