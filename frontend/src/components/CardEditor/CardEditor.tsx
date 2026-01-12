import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useCardStore } from '../../stores/cardStore';
import { useDeckStore } from '../../stores/deckStore';
import { Card } from '../../types';

interface CardEditorProps {
  card?: Card;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function CardEditor({ card, onSave, onCancel }: CardEditorProps) {
  const { createCard, updateCard } = useCardStore();
  const { selectedDeckId } = useDeckStore();
  const [front, setFront] = useState(card?.front || '');
  const [back, setBack] = useState(card?.back || '');
  const [tags, setTags] = useState(card?.tags?.join(', ') || '');
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    if (!selectedDeckId) {
      alert('Veuillez sélectionner un deck');
      return;
    }

    if (!front.trim() || !back.trim()) {
      alert('Le recto et le verso de la carte sont requis');
      return;
    }

    setIsSaving(true);
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      
      if (card) {
        await updateCard(card.id, {
          front: front.trim(),
          back: back.trim(),
          tags: tagArray,
        });
      } else {
        await createCard({
          deckId: selectedDeckId,
          front: front.trim(),
          back: back.trim(),
          tags: tagArray,
        });
      }
      
      setFront('');
      setBack('');
      setTags('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      onSave?.();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la carte');
    } finally {
      setIsSaving(false);
    }
  };

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S pour sauvegarder
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (front.trim() && back.trim() && !isSaving) {
          handleSave();
        }
      }
      // Échap pour annuler
      if (e.key === 'Escape' && onCancel) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [front, back, isSaving, onCancel]);

  if (!selectedDeckId) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto py-12">
          <div className="text-5xl mb-4">✏️</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Aucun deck sélectionné
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Veuillez sélectionner un deck dans l'onglet "Decks" pour créer des cartes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {showSuccess && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 rounded-lg animate-fadeIn">
          <p className="text-green-800 dark:text-green-200 font-semibold">
            ✓ Carte sauvegardée avec succès !
          </p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {card ? 'Modifier la carte' : 'Nouvelle carte'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Astuce : Utilisez Ctrl+S pour sauvegarder rapidement
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPreviewMode(previewMode === 'edit' ? 'preview' : 'edit')}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 transition-colors"
            title="Basculer entre édition et aperçu"
          >
            {previewMode === 'edit' ? '👁️ Aperçu' : '✏️ Éditer'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recto */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recto
          </label>
          {previewMode === 'edit' ? (
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Question ou mot à apprendre..."
              className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
            />
          ) : (
            <div className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white overflow-y-auto prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {front || '*Aperçu...*'}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Verso */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Verso
          </label>
          {previewMode === 'edit' ? (
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Réponse ou définition..."
              className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
            />
          ) : (
            <div className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white overflow-y-auto prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {back || '*Aperçu...*'}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags (séparés par des virgules)
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2, tag3"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Aide Markdown */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="font-semibold mb-2 text-blue-900 dark:text-blue-200 flex items-center gap-2">
          💡 Astuce : Formatage Markdown disponible
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm text-blue-800 dark:text-blue-300">
          <div><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">**gras**</code> → <strong>gras</strong></div>
          <div><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">*italique*</code> → <em>italique</em></div>
          <div><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">`code`</code> → <code>code</code></div>
          <div><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded"># Titre</code> → Titre</div>
        </div>
      </div>

      {/* Boutons */}
      <div className="mt-6 flex gap-4 items-center">
        <button
          onClick={handleSave}
          disabled={isSaving || !front.trim() || !back.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold shadow-md"
        >
          {isSaving ? '⏳ Sauvegarde...' : '💾 Sauvegarder (Ctrl+S)'}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 transition-colors"
          >
            Annuler (Échap)
          </button>
        )}
        {!front.trim() || !back.trim() ? (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ⚠️ Le recto et le verso sont requis
          </span>
        ) : null}
      </div>
    </div>
  );
}
