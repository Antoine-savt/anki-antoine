import { create } from 'zustand';
import { Card, StudySession } from '../types';
import { db } from '../services/database';
import { useCardStore } from './cardStore';

interface StudyStore {
  session: StudySession | null;
  isFlipped: boolean;
  startSession: (deckId: string) => Promise<void>;
  nextCard: () => void;
  flipCard: () => void;
  endSession: () => void;
  getNextCard: () => Card | null;
}

export const useStudyStore = create<StudyStore>((set, get) => ({
  session: null,
  isFlipped: false,

  startSession: async (deckId: string) => {
    // Charger toutes les cartes du deck
    await useCardStore.getState().loadCards(deckId);
    const allCards = await db.cards.where('deckId').equals(deckId).toArray();
    
    if (allCards.length === 0) {
      throw new Error('Aucune carte dans ce deck');
    }

    const session: StudySession = {
      deckId,
      cardsToReview: allCards,
      currentCardIndex: 0,
      startTime: new Date(),
      reviews: [],
    };

    set({ session, isFlipped: false });
  },

  nextCard: () => {
    const { session } = get();
    if (!session) return;

    const nextIndex = session.currentCardIndex + 1;

    if (nextIndex >= session.cardsToReview.length) {
      // Session terminée
      set({ session: null, isFlipped: false });
    } else {
      set({
        session: {
          ...session,
          currentCardIndex: nextIndex,
        },
        isFlipped: false,
      });
    }
  },

  flipCard: () => {
    set({ isFlipped: !get().isFlipped });
  },

  endSession: () => {
    set({ session: null, isFlipped: false });
  },

  getNextCard: () => {
    const { session } = get();
    if (!session) return null;
    return session.cardsToReview[session.currentCardIndex] || null;
  },
}));
