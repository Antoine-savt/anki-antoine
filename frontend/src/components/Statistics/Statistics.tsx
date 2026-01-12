import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { db } from '../../services/database';
import { useDeckStore } from '../../stores/deckStore';

interface DailyStats {
  date: string;
  reviews: number;
  cardsLearned: number;
}

export default function Statistics() {
  const { decks, getDecksWithStats } = useDeckStore();
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const [averageQuality, setAverageQuality] = useState(0);
  const [deckStats, setDeckStats] = useState<Array<{ name: string; cards: number; reviews: number }>>([]);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Mise à jour toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    // Charger les stats quotidiennes des 30 derniers jours
    const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));
    const reviews = await db.reviews
      .where('reviewDate')
      .above(thirtyDaysAgo)
      .toArray();

    // Calculer les stats par jour
    const statsMap = new Map<string, { reviews: number; cardsLearned: Set<string> }>();
    
    reviews.forEach((review) => {
      const dateKey = format(new Date(review.reviewDate), 'yyyy-MM-dd');
      if (!statsMap.has(dateKey)) {
        statsMap.set(dateKey, { reviews: 0, cardsLearned: new Set() });
      }
      const stats = statsMap.get(dateKey)!;
      stats.reviews++;
      stats.cardsLearned.add(review.cardId);
    });

    // Générer les 30 derniers jours avec leurs stats
    const dailyStatsArray: DailyStats[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const stats = statsMap.get(dateKey) || { reviews: 0, cardsLearned: new Set() };
      dailyStatsArray.push({
        date: format(date, 'dd/MM'),
        reviews: stats.reviews,
        cardsLearned: stats.cardsLearned.size,
      });
    }

    setDailyStats(dailyStatsArray);

    // Stats globales
    const allReviews = await db.reviews.toArray();
    const allCards = await db.cards.toArray();
    
    setTotalReviews(allReviews.length);
    setTotalCards(allCards.length);
    
    if (allReviews.length > 0) {
      const avgQuality = allReviews.reduce((sum, r) => sum + r.quality, 0) / allReviews.length;
      setAverageQuality(Math.round(avgQuality * 100) / 100);
    }

    // Stats par deck
    const decksWithStats = await getDecksWithStats();
    const deckStatsArray = await Promise.all(
      decksWithStats.map(async (deck) => {
        const deckReviews = await db.reviews
          .toArray()
          .then(reviews => reviews.filter(r => {
            return allCards.find(c => c.id === r.cardId && c.deckId === deck.id);
          }));
        
        return {
          name: deck.name,
          cards: deck.cardCount,
          reviews: deckReviews.length,
        };
      })
    );
    
    setDeckStats(deckStatsArray);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Statistiques</h2>

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total de cartes</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{totalCards}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total de révisions</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{totalReviews}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Qualité moyenne</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{averageQuality.toFixed(1)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Decks</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{decks.length}</p>
        </div>
      </div>

      {/* Graphique des révisions quotidiennes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Activité des 30 derniers jours
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="reviews" stroke="#3b82f6" name="Révisions" />
            <Line type="monotone" dataKey="cardsLearned" stroke="#10b981" name="Cartes apprises" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique des stats par deck */}
      {deckStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Statistiques par deck
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deckStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cards" fill="#3b82f6" name="Cartes" />
              <Bar dataKey="reviews" fill="#10b981" name="Révisions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
