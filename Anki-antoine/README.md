# Anki Web

Une application web moderne et intuitive pour la répétition espacée, inspirée d'Anki mais avec une interface plus conviviale.

## 🚀 Fonctionnalités

- **Gestion des decks** : Créez, organisez et gérez vos paquets de cartes
- **Éditeur de cartes** : Créez des cartes avec support Markdown et aperçu en temps réel
- **Répétition espacée** : Algorithme SM-2 pour optimiser votre apprentissage
- **Session d'étude** : Interface intuitive pour réviser vos cartes
- **Statistiques** : Suivez votre progression avec des graphiques détaillés
- **Import/Export** : Importez et exportez vos données en CSV ou JSON
- **Mode sombre** : Interface adaptée à vos préférences
- **Synchronisation cloud** : (Optionnel) Synchronisez vos données entre appareils

## 📋 Prérequis

- Node.js 18+ et npm
- Navigateur moderne avec support IndexedDB

## 🛠️ Installation

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Backend (Optionnel)

Le backend est nécessaire uniquement si vous souhaitez utiliser la synchronisation cloud.

```bash
cd backend
npm install
npm run dev
```

Le serveur API sera accessible sur `http://localhost:3001`

## 📁 Structure du projet

```
anki-web/
├── frontend/          # Application React
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── stores/        # Gestion d'état (Zustand)
│   │   ├── services/      # Services (DB, API)
│   │   ├── utils/         # Utilitaires (SM-2, import/export)
│   │   └── types/         # Types TypeScript
│   └── package.json
├── backend/           # API Node.js (optionnel)
│   ├── src/
│   │   ├── routes/        # Routes API
│   │   ├── database.ts    # Configuration SQLite
│   │   └── index.ts       # Point d'entrée
│   └── package.json
└── README.md
```

## 🎯 Utilisation

1. **Créer un deck** : Allez dans l'onglet "Decks" et créez votre premier deck
2. **Ajouter des cartes** : Sélectionnez un deck et allez dans "Cartes" pour créer vos premières cartes
3. **Étudier** : Allez dans "Étude" pour commencer une session de révision
4. **Suivre votre progression** : Consultez vos statistiques dans l'onglet "Statistiques"

## 💾 Stockage

- **Par défaut** : Les données sont stockées localement dans IndexedDB (navigateur)
- **Cloud** : Optionnellement, vous pouvez activer la synchronisation cloud avec le backend

## 🔧 Technologies utilisées

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- Dexie.js (IndexedDB)
- Recharts (graphiques)
- React Markdown

### Backend
- Node.js + Express
- SQLite
- TypeScript

## 📝 Format des cartes

Les cartes supportent le format Markdown :
- **Gras** : `**texte**`
- *Italique* : `*texte*`
- `Code` : `` `code` ``
- Titres : `# Titre`

## 🔒 Sécurité

- Les données sont stockées localement par défaut
- Le backend optionnel nécessiterait une authentification pour la production
- Actuellement, le backend utilise un userId temporaire (à améliorer pour la production)

## 🚧 Améliorations futures

- Import/export de fichiers .apkg (format Anki natif)
- Support audio et vidéo dans les cartes
- Mode hors-ligne amélioré
- Authentification et gestion multi-utilisateurs
- Synchronisation bidirectionnelle avec résolution de conflits
- Application mobile (PWA)

## 📄 Licence

Ce projet est un projet personnel d'apprentissage.

## 🤝 Contribution

Ce projet est en développement actif. Les suggestions et améliorations sont les bienvenues !
