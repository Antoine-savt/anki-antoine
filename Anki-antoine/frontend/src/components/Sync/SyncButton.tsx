import { useState, useEffect } from 'react';
import { syncToServer, syncFromServer, checkServerAvailable } from '../../services/syncService';

export default function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [serverAvailable, setServerAvailable] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    checkAvailability();
    const saved = localStorage.getItem('lastSync');
    if (saved) {
      setLastSync(saved);
    }
  }, []);

  const checkAvailability = async () => {
    const available = await checkServerAvailable();
    setServerAvailable(available);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // Synchronisation bidirectionnelle simple
      await syncFromServer();
      await syncToServer();
      const saved = localStorage.getItem('lastSync');
      if (saved) {
        setLastSync(saved);
      }
      alert('Synchronisation réussie !');
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      alert('Erreur lors de la synchronisation');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!serverAvailable) {
    return null; // Ne pas afficher si le serveur n'est pas disponible
  }

  return (
    <div className="flex items-center gap-2">
      {lastSync && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Dernière sync: {new Date(lastSync).toLocaleTimeString()}
        </span>
      )}
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        title="Synchroniser avec le cloud"
      >
        {isSyncing ? '⏳ Sync...' : '☁️ Sync'}
      </button>
    </div>
  );
}
