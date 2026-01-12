export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  createdAt: Date;
  updatedAt: Date;
  easeFactor: number; // Facteur de facilité (SM-2)
  interval: number; // Intervalle en jours
  repetitions: number; // Nombre de répétitions
  nextReview: Date; // Date de la prochaine révision
  images?: string[]; // URLs des images
  tags?: string[];
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  parentDeckId?: string; // Pour les sous-decks
  color?: string; // Couleur du deck
}

export interface Review {
  id: string;
  cardId: string;
  quality: number; // 0-5 (qualité de la réponse)
  reviewDate: Date;
  timeSpent: number; // Temps passé en secondes
}

export interface StudySession {
  deckId: string;
  cardsToReview: Card[];
  currentCardIndex: number;
  startTime: Date;
  reviews: Review[];
}
