# Anki Web Backend

Backend API optionnel pour la synchronisation cloud d'Anki Web.

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

Le serveur démarre sur le port 3001 par défaut.

## Production

```bash
npm run build
npm start
```

## API Endpoints

- `GET /api/health` - Vérification de santé
- `GET /api/sync/data` - Récupérer toutes les données
- `POST /api/sync/upload` - Synchroniser les données (upload)

## Note

Cette version utilise un userId temporaire. Pour une utilisation en production, il faudrait implémenter :
- Authentification (JWT, OAuth, etc.)
- Gestion des conflits de synchronisation
- Chiffrement des données sensibles
