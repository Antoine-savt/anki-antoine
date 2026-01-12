import { useEffect, useState } from 'react';
import { useDeckStore } from '../../stores/deckStore';
import { Deck } from '../../types';

interface DeckWithStats extends Deck {
  cardCount: number;
  dueCards: number;
}

export default function DeckList() {
  const { loadDecks, createDeck, deleteDeck, selectDeck, getDecksWithStats } = useDeckStore();
  const [decks, setDecks] = useState<DeckWithStats[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  useEffect(() => {
    const updateDecks = async () => {
      const decksWithStats = await getDecksWithStats();
      setDecks(decksWithStats);
    };
    updateDecks();
    const interval = setInterval(updateDecks, 5000); // Mise à jour toutes les 5 secondes
    return () => clearInterval(interval);
  }, [getDecksWithStats]);

  const handleCreateDeck = async () => {
    if (newDeckName.trim()) {
      await createDeck({
        name: newDeckName.trim(),
        description: '',
      });
      setNewDeckName('');
      setIsCreating(false);
    }
  };

  const handleDeleteDeck = async (id: string) => {
    await deleteDeck(id);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Mes Decks</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nouveau Deck
          </button>
        )}
      </div>

      {isCreating && (
        <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <input
            type="text"
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateDeck();
              if (e.key === 'Escape') {
                setIsCreating(false);
                setNewDeckName('');
              }
            }}
            placeholder="Nom du deck"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white mb-2"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateDeck}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Créer
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewDeckName('');
              }}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {decks.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">Aucun deck pour le moment</p>
          <p>Créez votre premier deck pour commencer !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => selectDeck(deck.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {deck.name}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(deck.id);
                  }}
                  className="text-red-500 hover:text-red-700 text-lg"
                >
                  ×
                </button>
              </div>
              
              {deck.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {deck.description}
                </p>
              )}

              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{deck.cardCount} cartes</span>
                <span className={deck.dueCards > 0 ? 'text-orange-600 font-semibold' : ''}>
                  {deck.dueCards} à réviser
                </span>
              </div>

              {showDeleteConfirm === deck.id && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                    Supprimer ce deck et toutes ses cartes ?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDeck(deck.id);
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(null);
                      }}
                      className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
