import { useEffect, useState } from 'react';
import { useDeckStore } from '../../stores/deckStore';
import { useCardStore } from '../../stores/cardStore';
import { useStudyStore } from '../../stores/studyStore';
import { Deck } from '../../types';
import Modal from '../UI/Modal';

interface DeckWithStats extends Deck {
  cardCount: number;
  dueCards: number;
}

export default function DeckList() {
  const { loadDecks, createDeck, deleteDeck, selectDeck, selectedDeckId, getDecksWithStats } = useDeckStore();
  const { createCard } = useCardStore();
  const { startSession } = useStudyStore();
  const [decks, setDecks] = useState<DeckWithStats[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckParentId, setNewDeckParentId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCardModal, setShowCardModal] = useState<string | null>(null);
  const [quickCardFront, setQuickCardFront] = useState('');
  const [quickCardBack, setQuickCardBack] = useState('');
  const [expandedDecks, setExpandedDecks] = useState<Set<string>>(new Set());

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
        parentDeckId: newDeckParentId || undefined,
      });
      setNewDeckName('');
      setNewDeckParentId(null);
      setIsCreating(false);
    }
  };

  const handleStartTraining = async (deckId: string) => {
    try {
      await startSession(deckId);
      // Changer vers l'onglet étude
      window.dispatchEvent(new CustomEvent('changeTab', { detail: 'study' }));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors du démarrage de la session');
    }
  };

  const handleDeleteDeck = async (id: string) => {
    await deleteDeck(id);
    setShowDeleteConfirm(null);
  };

  const handleCreateQuickCard = async (deckId: string) => {
    if (quickCardFront.trim() && quickCardBack.trim()) {
      await createCard({
        deckId,
        front: quickCardFront.trim(),
        back: quickCardBack.trim(),
        tags: [],
      });
      setQuickCardFront('');
      setQuickCardBack('');
      setShowCardModal(null);
      // Rafraîchir les stats
      const decksWithStats = await getDecksWithStats();
      setDecks(decksWithStats);
    }
  };

  const toggleExpand = (deckId: string) => {
    setExpandedDecks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deckId)) {
        newSet.delete(deckId);
      } else {
        newSet.add(deckId);
      }
      return newSet;
    });
  };

  // Organiser les decks par parent
  const mainDecks = decks.filter(d => !d.parentDeckId);
  const getSubDecks = (parentId: string) => decks.filter(d => d.parentDeckId === parentId);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Mes Decks</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Sélectionnez un deck pour commencer à étudier ou créer des cartes
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
            title="Créer un nouveau deck (Entrée pour confirmer)"
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
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Commencez votre apprentissage !
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Créez votre premier deck de cartes pour commencer à apprendre avec la répétition espacée.
            </p>
            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-lg"
              >
                + Créer mon premier deck
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {mainDecks.map((deck) => {
            const subDecks = getSubDecks(deck.id);
            const isExpanded = expandedDecks.has(deck.id);
            
            return (
              <div key={deck.id} className="space-y-2">
                {/* Deck principal */}
                <div
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all border-2 ${
                    selectedDeckId === deck.id
                      ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleExpand(deck.id)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mt-1"
                    >
                      {subDecks.length > 0 ? (isExpanded ? '▼' : '▶') : '•'}
                    </button>
                    
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => selectDeck(deck.id)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                              {deck.name}
                            </h3>
                            {selectedDeckId === deck.id && (
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full">
                                Sélectionné
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(deck.id);
                          }}
                          className="text-red-500 hover:text-red-700 text-lg font-bold ml-2"
                          title="Supprimer le deck"
                        >
                          ×
                        </button>
                      </div>
                      
                      {deck.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                          {deck.description}
                        </p>
                      )}

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">📝 Cartes</span>
                          <span className="font-semibold text-gray-800 dark:text-white">{deck.cardCount}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">⏰ À réviser</span>
                          <span className={`font-semibold ${deck.dueCards > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {deck.dueCards}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartTraining(deck.id);
                          }}
                          className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                        >
                          🎯 S'entraîner
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCardModal(deck.id);
                          }}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                        >
                          + Ajouter une carte
                        </button>
                      </div>
                    </div>
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

                {/* Sous-sections */}
                {isExpanded && subDecks.length > 0 && (
                  <div className="ml-8 space-y-2">
                    {subDecks.map((subDeck) => (
                      <div
                        key={subDeck.id}
                        className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow p-4 border-2 ${
                          selectedDeckId === subDeck.id
                            ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                            : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-gray-400 mt-1">└</div>
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => selectDeck(subDeck.id)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                                {subDeck.name}
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeleteConfirm(subDeck.id);
                                }}
                                className="text-red-500 hover:text-red-700 text-lg font-bold"
                              >
                                ×
                              </button>
                            </div>
                            <div className="flex gap-2 mb-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {subDeck.cardCount} cartes
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartTraining(subDeck.id);
                                }}
                                className="flex-1 px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs font-semibold"
                              >
                                🎯 S'entraîner
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowCardModal(subDeck.id);
                                }}
                                className="flex-1 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-semibold"
                              >
                                + Carte
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal pour ajouter une carte */}
      <Modal
        isOpen={showCardModal !== null}
        onClose={() => {
          setShowCardModal(null);
          setQuickCardFront('');
          setQuickCardBack('');
        }}
        title="Ajouter une carte"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recto (question)
            </label>
            <textarea
              value={quickCardFront}
              onChange={(e) => setQuickCardFront(e.target.value)}
              placeholder="Question ou mot à apprendre..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
              rows={3}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Verso (réponse)
            </label>
            <textarea
              value={quickCardBack}
              onChange={(e) => setQuickCardBack(e.target.value)}
              placeholder="Réponse ou définition..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (showCardModal) {
                  handleCreateQuickCard(showCardModal);
                }
              }}
              disabled={!quickCardFront.trim() || !quickCardBack.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              Créer
            </button>
            <button
              onClick={() => {
                setShowCardModal(null);
                setQuickCardFront('');
                setQuickCardBack('');
              }}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
            <div
              key={deck.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border-2 ${
                selectedDeckId === deck.id
                  ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => selectDeck(deck.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      {deck.name}
                    </h3>
                    {selectedDeckId === deck.id && (
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full">
                        Sélectionné
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(deck.id);
                  }}
                  className="text-red-500 hover:text-red-700 text-lg font-bold ml-2"
                  title="Supprimer le deck"
                >
                  ×
                </button>
              </div>
              
              {deck.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {deck.description}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">📝 Cartes</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{deck.cardCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">⏰ À réviser</span>
                  <span className={`font-semibold ${deck.dueCards > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {deck.dueCards}
                  </span>
                </div>
              </div>
              
              {selectedDeckId === deck.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCardForm(showCardForm === deck.id ? null : deck.id);
                    }}
                    className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                  >
                    + Ajouter une carte rapide
                  </button>
                  <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                    ✓ Cliquez sur "Étude" ou "Cartes" pour continuer
                  </p>
                </div>
              )}

              {showCardForm === deck.id && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={quickCardFront}
                      onChange={(e) => setQuickCardFront(e.target.value)}
                      placeholder="Recto (question)..."
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          handleCreateQuickCard(deck.id);
                        }
                      }}
                    />
                    <input
                      type="text"
                      value={quickCardBack}
                      onChange={(e) => setQuickCardBack(e.target.value)}
                      placeholder="Verso (réponse)..."
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          handleCreateQuickCard(deck.id);
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateQuickCard(deck.id);
                        }}
                        disabled={!quickCardFront.trim() || !quickCardBack.trim()}
                        className="flex-1 px-2 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Créer (Ctrl+Entrée)
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCardForm(null);
                          setQuickCardFront('');
                          setQuickCardBack('');
                        }}
                        className="px-2 py-1.5 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded text-sm hover:bg-gray-400"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
