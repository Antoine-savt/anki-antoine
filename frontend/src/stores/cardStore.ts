import { create } from 'zustand';
import { Card } from '../types';
import { db } from '../services/database';
import { createDefaultCard } from '../utils/sm2';

interface CardStore {
  cards: Card[];
  currentCard: Card | null;
  isLoading: boolean;
  loadCards: (deckId: string) => Promise<void>;
  createCard: (card: Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'easeFactor' | 'interval' | 'repetitions' | 'nextReview'>) => Promise<string>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  getCardsDue: (deckId: string) => Promise<Card[]>;
  getCardById: (id: string) => Promise<Card | undefined>;
}

export const useCardStore = create<CardStore>((set, get) => ({
  cards: [],
  currentCard: null,
  isLoading: false,

  loadCards: async (deckId: string) => {
    set({ isLoading: true });
    try {
      const cards = await db.cards.where('deckId').equals(deckId).toArray();
      set({ cards, isLoading: false });
    } catch (error) {
      console.error('Erreur lors du chargement des cartes:', error);
      set({ isLoading: false });
    }
  },

  createCard: async (cardData) => {
    const now = new Date();
    const defaults = createDefaultCard();
    const newCard: Card = {
      ...cardData,
      ...defaults as Card,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    
    await db.cards.add(newCard);
    await get().loadCards(cardData.deckId);
    return newCard.id;
  },

  updateCard: async (id, updates) => {
    await db.cards.update(id, { ...updates, updatedAt: new Date() });
    const card = await db.cards.get(id);
    if (card) {
      await get().loadCards(card.deckId);
    }
  },

  deleteCard: async (id) => {
    const card = await db.cards.get(id);
    if (card) {
      const deckId = card.deckId;
      // Supprimer aussi toutes les révisions associées
      await db.reviews.where('cardId').equals(id).delete();
      await db.cards.delete(id);
      await get().loadCards(deckId);
    }
  },

  getCardsDue: async (deckId: string) => {
    const now = new Date();
    return await db.cards
      .where('deckId')
      .equals(deckId)
      .filter((card) => new Date(card.nextReview) <= now)
      .toArray();
  },

  getCardById: async (id: string) => {
    return await db.cards.get(id);
  },
}));
