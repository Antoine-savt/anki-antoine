import express from 'express';
import cors from 'cors';
import { initDatabase } from './database';
import { syncRoutes } from './routes/sync';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sync', syncRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Anki Web Backend API' });
});

// Initialiser la base de données et démarrer le serveur
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erreur lors de l\'initialisation:', error);
    process.exit(1);
  });
