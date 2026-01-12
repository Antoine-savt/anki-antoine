import { Router } from 'express';
import { allQuery, getQuery, runQuery } from '../database';
import { v4 as uuidv4 } from 'uuid';

export const syncRoutes = Router();

// Pour cette version, on utilise un userId temporaire
// Dans une vraie app, on aurait une authentification
const TEMP_USER_ID = 'temp-user';

// Obtenir toutes les données d'un utilisateur
syncRoutes.get('/data', async (req, res) => {
  try {
    const decks = await allQuery(
      'SELECT * FROM decks WHERE user_id = ?',
      [TEMP_USER_ID]
    );

    const cards = await allQuery(
      `SELECT c.* FROM cards c
       INNER JOIN decks d ON c.deck_id = d.id
       WHERE d.user_id = ?`,
      [TEMP_USER_ID]
    );

    const reviews = await allQuery(
      `SELECT r.* FROM reviews r
       INNER JOIN cards c ON r.card_id = c.id
       INNER JOIN decks d ON c.deck_id = d.id
       WHERE d.user_id = ?`,
      [TEMP_USER_ID]
    );

    res.json({
      decks: decks.map(formatDeck),
      cards: cards.map(formatCard),
      reviews: reviews.map(formatReview),
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Synchroniser les données (upload)
syncRoutes.post('/upload', async (req, res) => {
  try {
    const { decks, cards, reviews, lastSync } = req.body;

    // Synchroniser les decks
    for (const deck of decks || []) {
      const existing = await getQuery(
        'SELECT id FROM decks WHERE id = ? AND user_id = ?',
        [deck.id, TEMP_USER_ID]
      );

      if (existing) {
        await runQuery(
          `UPDATE decks SET name = ?, description = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
          [deck.name, deck.description || '', new Date().toISOString(), deck.id, TEMP_USER_ID]
        );
      } else {
        await runQuery(
          `INSERT INTO decks (id, user_id, name, description, parent_deck_id, color, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            deck.id,
            TEMP_USER_ID,
            deck.name,
            deck.description || '',
            deck.parentDeckId || null,
            deck.color || null,
            deck.createdAt || new Date().toISOString(),
            deck.updatedAt || new Date().toISOString(),
          ]
        );
      }
    }

    // Synchroniser les cartes
    for (const card of cards || []) {
      const existing = await getQuery('SELECT id FROM cards WHERE id = ?', [card.id]);

      if (existing) {
        await runQuery(
          `UPDATE cards SET front = ?, back = ?, ease_factor = ?, interval = ?, repetitions = ?, 
           next_review = ?, updated_at = ? WHERE id = ?`,
          [
            card.front,
            card.back,
            card.easeFactor,
            card.interval,
            card.repetitions,
            card.nextReview,
            new Date().toISOString(),
            card.id,
          ]
        );
      } else {
        await runQuery(
          `INSERT INTO cards (id, deck_id, front, back, ease_factor, interval, repetitions, next_review, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            card.id,
            card.deckId,
            card.front,
            card.back,
            card.easeFactor || 2.5,
            card.interval || 0,
            card.repetitions || 0,
            card.nextReview,
            card.createdAt || new Date().toISOString(),
            card.updatedAt || new Date().toISOString(),
          ]
        );
      }
    }

    // Synchroniser les révisions
    for (const review of reviews || []) {
      const existing = await getQuery('SELECT id FROM reviews WHERE id = ?', [review.id]);

      if (!existing) {
        await runQuery(
          `INSERT INTO reviews (id, card_id, quality, review_date, time_spent)
           VALUES (?, ?, ?, ?, ?)`,
          [
            review.id,
            review.cardId,
            review.quality,
            review.reviewDate,
            review.timeSpent || 0,
          ]
        );
      }
    }

    res.json({
      success: true,
      message: 'Synchronisation réussie',
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Fonctions de formatage
function formatDeck(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    parentDeckId: row.parent_deck_id,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatCard(row: any) {
  return {
    id: row.id,
    deckId: row.deck_id,
    front: row.front,
    back: row.back,
    easeFactor: row.ease_factor,
    interval: row.interval,
    repetitions: row.repetitions,
    nextReview: row.next_review,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatReview(row: any) {
  return {
    id: row.id,
    cardId: row.card_id,
    quality: row.quality,
    reviewDate: row.review_date,
    timeSpent: row.time_spent,
  };
}
