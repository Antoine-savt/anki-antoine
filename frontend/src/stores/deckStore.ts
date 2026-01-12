import { create } from 'zustand';
import { Deck } from '../types';
import { db } from '../services/database';

interface DeckStore {
  decks: Deck[];
  selectedDeckId: string | null;
  isLoading: boolean;
  loadDecks: () => Promise<void>;
  createDeck: (deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateDeck: (id: string, updates: Partial<Deck>) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  selectDeck: (id: string | null) => void;
  getDeckCardCount: (deckId: string) => Promise<number>;
  getDecksWithStats: () => Promise<(Deck & { cardCount: number; dueCards: number })[]>;
}

export const useDeckStore = create<DeckStore>((set, get) => ({
  decks: [],
  selectedDeckId: null,
  isLoading: false,

  loadDecks: async () => {
    set({ isLoading: true });
    try {
      const decks = await db.decks.toArray();
      set({ decks, isLoading: false });
    } catch (error) {
      console.error('Erreur lors du chargement des decks:', error);
      set({ isLoading: false });
    }
  },

  createDeck: async (deckData) => {
    const now = new Date();
    const newDeck: Deck = {
      ...deckData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    
    await db.decks.add(newDeck);
    await get().loadDecks();
    return newDeck.id;
  },

  updateDeck: async (id, updates) => {
    await db.decks.update(id, { ...updates, updatedAt: new Date() });
    await get().loadDecks();
  },

  deleteDeck: async (id) => {
    // Supprimer aussi toutes les cartes associées
    await db.cards.where('deckId').equals(id).delete();
    await db.decks.delete(id);
    await get().loadDecks();
    
    // Si le deck supprimé était sélectionné, désélectionner
    if (get().selectedDeckId === id) {
      set({ selectedDeckId: null });
    }
  },

  selectDeck: (id) => {
    set({ selectedDeckId: id });
  },

  getDeckCardCount: async (deckId) => {
    return await db.cards.where('deckId').equals(deckId).count();
  },

  getDecksWithStats: async () => {
    const decks = await db.decks.toArray();
    const now = new Date();
    
    return Promise.all(
      decks.map(async (deck) => {
        const cards = await db.cards.where('deckId').equals(deck.id).toArray();
        const cardCount = cards.length;
        const dueCards = cards.filter(
          (card) => new Date(card.nextReview) <= now
        ).length;
        
        return { ...deck, cardCount, dueCards };
      })
    );
  },
}));
