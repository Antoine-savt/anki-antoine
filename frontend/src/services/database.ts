import Dexie, { Table } from 'dexie';
import { Card, Deck, Review } from '../types';

class AnkiDatabase extends Dexie {
  decks!: Table<Deck>;
  cards!: Table<Card>;
  reviews!: Table<Review>;

  constructor() {
    super('AnkiDatabase');
    
    this.version(1).stores({
      decks: 'id, name, parentDeckId, createdAt',
      cards: 'id, deckId, nextReview, createdAt',
      reviews: 'id, cardId, reviewDate'
    });
  }
}

export const db = new AnkiDatabase();
