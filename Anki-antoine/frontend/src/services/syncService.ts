import { Card, Deck, Review } from '../types';
import { db } from './database';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

export interface SyncResult {
  success: boolean;
  lastSync: string;
  error?: string;
}

/**
 * Synchronise les données locales avec le serveur
 */
export async function syncToServer(): Promise<SyncResult> {
  try {
    // Récupérer toutes les données locales
    const decks = await db.decks.toArray();
    const cards = await db.cards.toArray();
    const reviews = await db.reviews.toArray();

    const lastSync = localStorage.getItem('lastSync') || new Date(0).toISOString();

    const response = await fetch(`${API_URL}/sync/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        decks,
        cards,
        reviews,
        lastSync,
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la synchronisation');
    }

    const data = await response.json();
    localStorage.setItem('lastSync', data.lastSync);

    return {
      success: true,
      lastSync: data.lastSync,
    };
  } catch (error) {
    console.error('Erreur de synchronisation:', error);
    return {
      success: false,
      lastSync: localStorage.getItem('lastSync') || new Date(0).toISOString(),
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Récupère les données du serveur et les fusionne avec les données locales
 */
export async function syncFromServer(): Promise<SyncResult> {
  try {
    const response = await fetch(`${API_URL}/sync/data`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des données');
    }

    const data = await response.json();

    // Fusionner les données (stratégie simple : le serveur gagne)
    // TODO: Implémenter une vraie gestion des conflits
    await db.decks.bulkPut(data.decks);
    await db.cards.bulkPut(data.cards);
    await db.reviews.bulkPut(data.reviews);

    localStorage.setItem('lastSync', data.lastSync);

    return {
      success: true,
      lastSync: data.lastSync,
    };
  } catch (error) {
    console.error('Erreur de synchronisation:', error);
    return {
      success: false,
      lastSync: localStorage.getItem('lastSync') || new Date(0).toISOString(),
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Vérifie si le serveur est disponible
 */
export async function checkServerAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
