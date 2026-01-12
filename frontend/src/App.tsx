import { useState, useEffect } from 'react';
import Navigation, { Tab } from './components/Navigation/Navigation';
import DeckList from './components/DeckList/DeckList';
import StudySession from './components/StudySession/StudySession';
import CardEditor from './components/CardEditor/CardEditor';
import CardList from './components/CardList/CardList';
import Statistics from './components/Statistics/Statistics';
import ImportExport from './components/ImportExport/ImportExport';
import { useDeckStore } from './stores/deckStore';

function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('decks');
  const { loadDecks } = useDeckStore();

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const renderContent = () => {
    switch (currentTab) {
      case 'decks':
        return <DeckList />;
      case 'study':
        return <StudySession />;
      case 'cards':
        return (
          <div>
            <CardEditor />
            <CardList />
          </div>
        );
      case 'stats':
        return <Statistics />;
      case 'import':
        return <ImportExport />;
      default:
        return <DeckList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
      <main className="container mx-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;