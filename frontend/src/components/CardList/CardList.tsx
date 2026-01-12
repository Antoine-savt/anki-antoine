import { useEffect, useState } from 'react';
import { useCardStore } from '../../stores/cardStore';
import { useDeckStore } from '../../stores/deckStore';
import { format } from 'date-fns';

export default function CardList() {
  const { selectedDeckId } = useDeckStore();
  const { cards, loadCards, deleteCard } = useCardStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDeckId) {
      loadCards(selectedDeckId);
    }
  }, [selectedDeckId, loadCards]);

  if (!selectedDeckId) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <p>Veuillez sélectionner un deck pour voir les cartes</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Cartes ({cards.length})
        </h2>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">Aucune carte dans ce deck</p>
          <p>Créez votre première carte pour commencer !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="mb-2">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Recto:</span>
                    <div className="mt-1 text-gray-800 dark:text-white">
                      {card.front.length > 100 ? `${card.front.substring(0, 100)}...` : card.front}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Verso:</span>
                    <div className="mt-1 text-gray-800 dark:text-white">
                      {card.back.length > 100 ? `${card.back.substring(0, 100)}...` : card.back}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(card.id);
                  }}
                  className="ml-4 text-red-500 hover:text-red-700 text-lg"
                >
                  ×
                </button>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <div className="flex gap-4">
                  {card.tags && card.tags.length > 0 && (
                    <div className="flex gap-2">
                      {card.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <span>Prochaine révision: {format(new Date(card.nextReview), 'dd/MM/yyyy')}</span>
                </div>
              </div>

              {showDeleteConfirm === card.id && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                    Supprimer cette carte ?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        deleteCard(card.id);
                        setShowDeleteConfirm(null);
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
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
