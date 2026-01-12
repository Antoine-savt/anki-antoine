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
      onSave?.();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la carte');
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedDeckId) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <p>Veuillez sélectionner un deck pour créer une carte</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {card ? 'Modifier la carte' : 'Nouvelle carte'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setPreviewMode(previewMode === 'edit' ? 'preview' : 'edit')}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400"
          >
            {previewMode === 'edit' ? 'Aperçu' : 'Éditer'}
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
      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
        <p className="font-semibold mb-1">Astuce Markdown :</p>
        <ul className="list-disc list-inside space-y-1">
          <li><code>**gras**</code> pour le texte en gras</li>
          <li><code>*italique*</code> pour le texte en italique</li>
          <li><code>`code`</code> pour le code inline</li>
          <li><code># Titre</code> pour les titres</li>
        </ul>
      </div>

      {/* Boutons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving || !front.trim() || !back.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400"
          >
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}
