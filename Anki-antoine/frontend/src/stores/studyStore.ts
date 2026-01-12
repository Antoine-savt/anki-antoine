import { create } from 'zustand';
import { Card, Review, StudySession } from '../types';
import { db } from '../services/database';
import { calculateSM2, difficultyToQuality } from '../utils/sm2';
import { useCardStore } from './cardStore';

interface StudyStore {
  session: StudySession | null;
  isFlipped: boolean;
  startSession: (deckId: string) => Promise<void>;
  answerCard: (difficulty: 'easy' | 'medium' | 'hard') => Promise<void>;
  flipCard: () => void;
  endSession: () => void;
  getNextCard: () => Card | null;
}

export const useStudyStore = create<StudyStore>((set, get) => ({
  session: null,
  isFlipped: false,

  startSession: async (deckId: string) => {
    const cardsToReview = await useCardStore.getState().getCardsDue(deckId);
    
    if (cardsToReview.length === 0) {
      throw new Error('Aucune carte à réviser dans ce deck');
    }

    const session: StudySession = {
      deckId,
      cardsToReview,
      currentCardIndex: 0,
      startTime: new Date(),
      reviews: [],
    };

    set({ session, isFlipped: false });
  },

  answerCard: async (difficulty: 'easy' | 'medium' | 'hard') => {
    const { session } = get();
    if (!session) return;

    const currentCard = session.cardsToReview[session.currentCardIndex];
    if (!currentCard) return;

    const quality = difficultyToQuality(difficulty);
    const sm2Result = calculateSM2(currentCard, quality);

    // Mettre à jour la carte
    const updatedCard: Card = {
      ...currentCard,
      ...sm2Result,
      updatedAt: new Date(),
    };

    await db.cards.update(currentCard.id, updatedCard);

    // Créer une révision
    const review: Review = {
      id: crypto.randomUUID(),
      cardId: currentCard.id,
      quality,
      reviewDate: new Date(),
      timeSpent: 0, // TODO: calculer le temps réel
    };

    await db.reviews.add(review);

    // Mettre à jour la session
    const newReviews = [...session.reviews, review];
    const nextIndex = session.currentCardIndex + 1;

    if (nextIndex >= session.cardsToReview.length) {
      // Session terminée
      set({ session: null, isFlipped: false });
    } else {
      set({
        session: {
          ...session,
          reviews: newReviews,
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
