import { Card } from '../types';

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
}

/**
 * Algorithme SM-2 pour la répétition espacée
 * @param card - La carte à mettre à jour
 * @param quality - Qualité de la réponse (0-5)
 * @returns Résultat avec les nouveaux paramètres
 */
export function calculateSM2(card: Card, quality: number): SM2Result {
  // Qualité doit être entre 0 et 5
  const q = Math.max(0, Math.min(5, quality));
  
  let { easeFactor, interval, repetitions } = card;
  
  // Si la qualité est < 3, on réinitialise les répétitions
  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    // Premier intervalle : 1 jour
    if (repetitions === 0) {
      interval = 1;
    }
    // Deuxième intervalle : 6 jours
    else if (repetitions === 1) {
      interval = 6;
    }
    // Intervalles suivants : intervalle précédent × facteur de facilité
    else {
      interval = Math.round(interval * easeFactor);
    }
    
    repetitions += 1;
  }
  
  // Calcul du nouveau facteur de facilité
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  
  // Le facteur de facilité ne peut pas être inférieur à 1.3
  easeFactor = Math.max(1.3, easeFactor);
  
  // Date de la prochaine révision
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  
  return {
    easeFactor: Math.round(easeFactor * 100) / 100, // Arrondir à 2 décimales
    interval,
    repetitions,
    nextReview
  };
}

/**
 * Convertit la qualité de réponse en nombre pour SM-2
 * @param difficulty - "easy", "medium", "hard"
 * @returns Qualité (0-5)
 */
export function difficultyToQuality(difficulty: 'easy' | 'medium' | 'hard'): number {
  switch (difficulty) {
    case 'easy':
      return 5;
    case 'medium':
      return 3;
    case 'hard':
      return 2;
    default:
      return 3;
  }
}

/**
 * Crée une nouvelle carte avec les valeurs par défaut SM-2
 */
export function createDefaultCard(): Partial<Card> {
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: new Date()
  };
}
