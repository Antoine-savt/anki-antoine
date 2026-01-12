import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useStudyStore } from '../../stores/studyStore';
import { useDeckStore } from '../../stores/deckStore';

export default function StudySession() {
  const { session, isFlipped, startSession, nextCard, flipCard, endSession, getNextCard } = useStudyStore();
  const { selectedDeckId } = useDeckStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session && selectedDeckId) {
      handleStartSession();
    }
  }, [selectedDeckId]);

  const handleStartSession = async () => {
    if (!selectedDeckId) return;
    
    try {
      setError(null);
      await startSession(selectedDeckId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du démarrage de la session');
    }
  };

  // Raccourcis clavier
  useEffect(() => {
    if (!session) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isFlipped) {
          // Afficher la réponse
          flipCard();
        } else {
          // Passer à la carte suivante
          nextCard();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session, isFlipped, flipCard, nextCard]);

  const currentCard = getNextCard();
  const progress = session
    ? Math.round(((session.currentCardIndex + 1) / session.cardsToReview.length) * 100)
    : 0;

  if (!selectedDeckId) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto py-12">
          <div className="text-5xl mb-4">📖</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Aucun deck sélectionné
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Veuillez sélectionner un deck dans l'onglet "Decks" pour commencer une session d'étude.
          </p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={handleStartSession}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 text-center">
        <button
          onClick={handleStartSession}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold transition-colors"
        >
          Démarrer la session d'étude
        </button>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="p-6 text-center">
        <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-4">
            🎉 Session terminée !
          </h2>
          <p className="text-green-700 dark:text-green-300 mb-6">
            Vous avez révisé {session.cardsToReview.length} carte(s)
          </p>
        </div>
        <button
          onClick={() => {
            endSession();
            handleStartSession();
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Nouvelle session
        </button>
        <button
          onClick={() => {
            endSession();
          }}
          className="ml-4 px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Barre de progression */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Carte {session.currentCardIndex + 1} sur {session.cardsToReview.length}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Carte */}
      <div className="mb-6">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 min-h-[300px] flex items-center justify-center cursor-pointer transform transition-transform hover:scale-[1.02]"
          onClick={flipCard}
        >
          <div className="w-full prose dark:prose-invert max-w-none text-center">
            {!isFlipped ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {currentCard.front}
              </ReactMarkdown>
            ) : (
              <div>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {currentCard.front}
                </ReactMarkdown>
                <hr className="my-6 border-gray-300 dark:border-gray-600" />
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {currentCard.back}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
          {!isFlipped ? (
            <>👆 Cliquez sur la carte ou appuyez sur <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Espace</kbd> pour afficher la réponse</>
          ) : (
            <>👆 Appuyez sur <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Espace</kbd> pour passer à la carte suivante</>
          )}
        </p>
      </div>

      {/* Bouton quitter */}
      <div className="mt-6 text-center">
        <button
          onClick={endSession}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Quitter la session
        </button>
      </div>
    </div>
  );
}
