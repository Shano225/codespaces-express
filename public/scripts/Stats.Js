// Stats.js
// Fetches and displays statistics on the Home page

document.addEventListener('DOMContentLoaded', () => {
  fetchStats();
});

async function fetchStats() {
  const totalCardsEl = document.getElementById('stat-total-cards');
  const strugglingEl = document.getElementById('stat-struggling');
  const decksEl = document.getElementById('stat-decks');
  const masteredEl = document.getElementById('stat-mastered');

  // Only proceed if we are on a page that has these elements
  if (!totalCardsEl) return;

  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    
    const data = await res.json();
    
    totalCardsEl.textContent = data.totalCards;
    strugglingEl.textContent = data.strugglingCards;
    decksEl.textContent = data.totalDecks;
    masteredEl.textContent = data.masteredCards;
    
  } catch (err) {
    console.error('Error loading stats:', err);
    // On error, show '—'
    [totalCardsEl, strugglingEl, decksEl, masteredEl].forEach(el => {
      if(el) el.textContent = '—';
    });
  }
}
