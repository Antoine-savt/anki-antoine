import { useState, useEffect } from 'react';
import SyncButton from '../Sync/SyncButton';

export type Tab = 'decks' | 'study' | 'cards' | 'stats' | 'import';

interface NavigationProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Navigation({ currentTab, onTabChange }: NavigationProps) {
  const [darkMode, setDarkMode] = useState(() => {
    // Vérifier la préférence système ou le localStorage
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Appliquer le mode sombre
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const tabs: Array<{ id: Tab; label: string; icon: string }> = [
    { id: 'decks', label: 'Decks', icon: '📚' },
    { id: 'study', label: 'Étude', icon: '📖' },
    { id: 'cards', label: 'Cartes', icon: '✏️' },
    { id: 'stats', label: 'Statistiques', icon: '📊' },
    { id: 'import', label: 'Import/Export', icon: '💾' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-1">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Anki Web</h1>
          </div>

          <div className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={tab.label}
              >
                <span className="mr-2">{tab.icon}</span>
                <span className="hidden sm:inline font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <SyncButton />
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
