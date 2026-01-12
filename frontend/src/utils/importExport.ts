import { Card } from '../types';
import { db } from '../services/database';
import { createDefaultCard } from './sm2';

/**
 * Exporte les decks et cartes au format CSV
 */
export async function exportToCSV(): Promise<string> {
  const decks = await db.decks.toArray();
  const cards = await db.cards.toArray();

  // En-tête CSV
  const csvRows = [
    'Deck Name,Deck Description,Card Front,Card Back,Tags,Next Review',
  ];

  // Créer un map pour accéder rapidement aux decks
  const deckMap = new Map(decks.map(d => [d.id, d]));

  // Ajouter chaque carte avec son deck
  for (const card of cards) {
    const deck = deckMap.get(card.deckId);
    const deckName = deck?.name || 'Unknown';
    const deckDescription = deck?.description || '';
    const tags = card.tags?.join(';') || '';
    const nextReview = card.nextReview ? new Date(card.nextReview).toISOString() : '';

    csvRows.push(
      `"${escapeCSV(deckName)}","${escapeCSV(deckDescription)}","${escapeCSV(card.front)}","${escapeCSV(card.back)}","${escapeCSV(tags)}","${nextReview}"`
    );
  }

  return csvRows.join('\n');
}

/**
 * Importe des cartes depuis un fichier CSV
 */
export async function importFromCSV(csvContent: string): Promise<{ imported: number; errors: string[] }> {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const errors: string[] = [];
  let imported = 0;

  if (lines.length < 2) {
    throw new Error('Le fichier CSV est vide ou invalide');
  }

  // Ignorer l'en-tête
  for (let i = 1; i < lines.length; i++) {
    try {
      const line = lines[i];
      const columns = parseCSVLine(line);

      if (columns.length < 4) {
        errors.push(`Ligne ${i + 1}: Format invalide`);
        continue;
      }

      const [deckName, deckDescription, front, back, tags, nextReview] = columns;

      // Trouver ou créer le deck
      let deck = await db.decks.where('name').equals(deckName).first();
      if (!deck) {
        const deckId = crypto.randomUUID();
        deck = {
          id: deckId,
          name: deckName,
          description: deckDescription || '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await db.decks.add(deck);
      }

      // Créer la carte
      const defaults = createDefaultCard();
      const tagArray = tags ? tags.split(';').map(t => t.trim()).filter(t => t) : [];
      const nextReviewDate = nextReview ? new Date(nextReview) : new Date();

      const card: Card = {
        id: crypto.randomUUID(),
        deckId: deck.id,
        front: front || '',
        back: back || '',
        tags: tagArray,
        createdAt: new Date(),
        updatedAt: new Date(),
        easeFactor: defaults.easeFactor || 2.5,
        interval: defaults.interval || 0,
        repetitions: defaults.repetitions || 0,
        nextReview: nextReviewDate,
      };

      await db.cards.add(card);
      imported++;
    } catch (error) {
      errors.push(`Ligne ${i + 1}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  return { imported, errors };
}

/**
 * Exporte les données au format JSON (pour sauvegarde)
 */
export async function exportToJSON(): Promise<string> {
  const decks = await db.decks.toArray();
  const cards = await db.cards.toArray();
  const reviews = await db.reviews.toArray();

  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    decks,
    cards,
    reviews,
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Importe les données depuis un fichier JSON
 */
export async function importFromJSON(jsonContent: string): Promise<void> {
  const data = JSON.parse(jsonContent);

  if (!data.decks || !data.cards) {
    throw new Error('Format de fichier invalide');
  }

  // Importer les decks
  for (const deck of data.decks) {
    await db.decks.put(deck);
  }

  // Importer les cartes
  for (const card of data.cards) {
    await db.cards.put(card);
  }

  // Importer les révisions si présentes
  if (data.reviews) {
    for (const review of data.reviews) {
      await db.reviews.put(review);
    }
  }
}

/**
 * Échappe les caractères spéciaux dans CSV
 */
function escapeCSV(str: string): string {
  if (!str) return '';
  return str.replace(/"/g, '""').replace(/\n/g, ' ');
}

/**
 * Parse une ligne CSV en gérant les guillemets
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}

/**
 * Télécharge un fichier
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Lit un fichier comme texte
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Impossible de lire le fichier'));
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
