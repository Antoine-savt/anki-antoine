import { useState } from 'react';
import { exportToCSV, exportToJSON, importFromCSV, importFromJSON, downloadFile, readFileAsText } from '../../utils/importExport';
import { useDeckStore } from '../../stores/deckStore';

export default function ImportExport() {
  const { loadDecks } = useDeckStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csv = await exportToCSV();
      downloadFile(csv, `anki-export-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      alert('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const json = await exportToJSON();
      downloadFile(json, `anki-backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    } catch (error) {
      console.error('Erreur lors de l\'export JSON:', error);
      alert('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const content = await readFileAsText(file);
      const result = await importFromCSV(content);
      setImportResult(result);
      await loadDecks();
      
      if (result.errors.length > 0) {
        console.warn('Certaines lignes n\'ont pas pu être importées:', result.errors);
      }
    } catch (error) {
      console.error('Erreur lors de l\'import CSV:', error);
      alert(`Erreur lors de l'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsImporting(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const content = await readFileAsText(file);
      await importFromJSON(content);
      await loadDecks();
      setImportResult({ imported: 1, errors: [] });
      alert('Import réussi !');
    } catch (error) {
      console.error('Erreur lors de l\'import JSON:', error);
      alert(`Erreur lors de l'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsImporting(false);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Import / Export</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Exporter</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Téléchargez vos decks et cartes pour sauvegarder ou partager.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? 'Export en cours...' : 'Exporter en CSV'}
            </button>
            
            <button
              onClick={handleExportJSON}
              disabled={isExporting}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? 'Export en cours...' : 'Exporter en JSON (sauvegarde complète)'}
            </button>
          </div>
        </div>

        {/* Import */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Importer</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Importez des cartes depuis un fichier CSV ou restaurez une sauvegarde JSON.
          </p>
          
          <div className="space-y-3">
            <label className="block">
              <span className="sr-only">Importer CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                disabled={isImporting}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
              />
            </label>
            
            <label className="block">
              <span className="sr-only">Importer JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                disabled={isImporting}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 disabled:opacity-50"
              />
            </label>
          </div>

          {isImporting && (
            <p className="mt-4 text-sm text-blue-600 dark:text-blue-400">Import en cours...</p>
          )}

          {importResult && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                {importResult.imported} élément(s) importé(s) avec succès
              </p>
              {importResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200">Erreurs:</p>
                  <ul className="text-xs text-red-700 dark:text-red-300 list-disc list-inside">
                    {importResult.errors.slice(0, 5).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li>... et {importResult.errors.length - 5} autre(s) erreur(s)</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Note sur .apkg */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> L'import/export de fichiers .apkg (format Anki natif) sera ajouté dans une mise à jour future.
          Pour l'instant, utilisez le format CSV ou JSON pour échanger vos données.
        </p>
      </div>
    </div>
  );
}
