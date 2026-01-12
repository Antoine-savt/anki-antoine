# Guide d'installation et de démarrage

## Installation rapide

### 1. Frontend

```bash
cd frontend
npm install
```

### 2. Backend (Optionnel)

```bash
cd backend
npm install
```

## Démarrage

### Mode développement

**Frontend uniquement (recommandé pour commencer) :**
```bash
cd frontend
npm run dev
```
L'application sera accessible sur http://localhost:5173

**Avec backend (pour la synchronisation cloud) :**
Terminal 1 - Backend :
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend :
```bash
cd frontend
npm run dev
```

## Première utilisation

1. Ouvrez l'application dans votre navigateur
2. Créez votre premier deck dans l'onglet "Decks"
3. Sélectionnez le deck et allez dans "Cartes" pour ajouter des cartes
4. Allez dans "Étude" pour commencer à réviser

## Configuration

### Variables d'environnement (optionnel)

Créez un fichier `frontend/.env` :
```
VITE_API_URL=http://localhost:3001/api
```

## Notes importantes

- Les données sont stockées localement dans le navigateur (IndexedDB)
- Le backend est optionnel et n'est nécessaire que pour la synchronisation cloud
- Pour utiliser la synchronisation, assurez-vous que le backend est démarré

## Dépannage

### Le frontend ne démarre pas
- Vérifiez que Node.js 18+ est installé
- Supprimez `node_modules` et `package-lock.json`, puis réinstallez avec `npm install`

### Le backend ne démarre pas
- Vérifiez que le port 3001 n'est pas déjà utilisé
- Assurez-vous que SQLite est installé sur votre système

### Erreurs de compilation TypeScript
- Vérifiez que tous les packages sont installés
- Exécutez `npm install` dans les dossiers frontend et backend
