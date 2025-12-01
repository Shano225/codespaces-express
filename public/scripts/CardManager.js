// Flashcard manager: fetches cards/decks and provides filtering + deletion UI.
const state = {
  cards: [],
  decks: [],
  filters: {
    search: '',
    deckId: '',
    reaction: ''
  }
};

let dom = {};
let messageTimeout;

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('mainscreen');
  if (!root) return;

  root.classList.add('manager-shell');
  root.innerHTML = createLayout();
  cacheDomReferences(root);
  attachEvents();
  loadInitialData();
});

function createLayout() {
  return `
    <div class="manager-inner">
      <header class="manager-header">
        <div>
          <h1>Flashcard Manager</h1>
          <p class="manager-subtitle">Browse, search, and maintain your flashcards.</p>
        </div>
        <button class="manager-button ghost" data-refresh>
          <span>↻</span>
          Refresh
        </button>
      </header>

      <section class="manager-controls">
        <input
          type="search"
          class="manager-input"
          placeholder="Search front/back text"
          data-search
        />
        <select class="manager-input" data-deck-filter>
          <option value="">All decks</option>
        </select>
        <select class="manager-input" data-reaction-filter>
          <option value="">All reactions</option>
          <option value="again">Again</option>
          <option value="hard">Hard</option>
          <option value="unsure">Unsure</option>
          <option value="good">Good</option>
          <option value="great">Great</option>
        </select>
      </section>

      <section class="manager-table-wrapper">
        <table class="card-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Front</th>
              <th>Back</th>
              <th>Deck</th>
              <th>Reaction</th>
              <th></th>
            </tr>
          </thead>
          <tbody data-card-rows></tbody>
        </table>
        <div class="manager-empty" data-empty>Loading cards…</div>
      </section>

      <footer class="manager-footer">
        <span data-stats>0 cards loaded.</span>
        <span class="manager-message" data-message></span>
      </footer>
    </div>
  `;
}

function cacheDomReferences(root) {
  dom = {
    searchInput: root.querySelector('[data-search]'),
    deckFilter: root.querySelector('[data-deck-filter]'),
    reactionFilter: root.querySelector('[data-reaction-filter]'),
    refreshButton: root.querySelector('[data-refresh]'),
    tableBody: root.querySelector('[data-card-rows]'),
    emptyState: root.querySelector('[data-empty]'),
    stats: root.querySelector('[data-stats]'),
    message: root.querySelector('[data-message]')
  };
}

function attachEvents() {
  dom.searchInput?.addEventListener('input', (e) => {
    state.filters.search = e.target.value.trim().toLowerCase();
    renderCards();
  });

  dom.deckFilter?.addEventListener('change', (e) => {
    state.filters.deckId = e.target.value;
    renderCards();
  });

  dom.reactionFilter?.addEventListener('change', (e) => {
    state.filters.reaction = e.target.value;
    renderCards();
  });

  dom.refreshButton?.addEventListener('click', () => {
    loadInitialData(true);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      e.preventDefault();
      window.location.href = '/home';
    }
  });
}

async function loadInitialData(showToast = false) {
  setLoading('Loading cards…');
  try {
    await Promise.all([loadDecks(), loadCards()]);
    clearLoading();
    if (showToast) {
      showMessage('Cards refreshed.', 'success');
    }
  } catch (err) {
    console.error(err);
    setLoading('Failed to load cards. Try again.');
    showMessage('Unable to load data from the server.', 'error');
  }
}

async function loadDecks() {
  const res = await fetch('/api/decks');
  if (!res.ok) {
    throw new Error('Failed to fetch decks');
  }
  const data = await res.json();
  state.decks = data.decks || [];
  populateDeckFilter();
}

async function loadCards() {
  const res = await fetch('/api');
  if (!res.ok) {
    throw new Error('Failed to fetch cards');
  }
  const data = await res.json();
  state.cards = data.flashcards || [];
  renderCards();
}

function populateDeckFilter() {
  if (!dom.deckFilter) return;
  const current = state.filters.deckId;
  dom.deckFilter.innerHTML = '<option value="">All decks</option>';
  state.decks.forEach((deck) => {
    const option = document.createElement('option');
    option.value = deck.DeckID;
    option.textContent = deck.Name;
    if (String(deck.DeckID) === String(current)) {
      option.selected = true;
    }
    dom.deckFilter.appendChild(option);
  });
}

function renderCards() {
  if (!dom.tableBody) return;

  const filtered = state.cards.filter((card) => {
    const matchesSearch = state.filters.search
      ? (card.Front?.toLowerCase().includes(state.filters.search) ||
         card.Back?.toLowerCase().includes(state.filters.search) ||
         card.Reaction?.toLowerCase().includes(state.filters.search))
      : true;

    const matchesDeck = state.filters.deckId
      ? String(card.DeckID) === String(state.filters.deckId)
      : true;

    const matchesReaction = state.filters.reaction
      ? (card.Reaction || '').toLowerCase() === state.filters.reaction.toLowerCase()
      : true;

    return matchesSearch && matchesDeck && matchesReaction;
  });

  dom.tableBody.innerHTML = '';

  if (!filtered.length) {
    dom.emptyState.textContent = state.cards.length
      ? 'No cards match your filters.'
      : 'No flashcards yet. Create one to get started.';
    dom.emptyState.style.display = 'flex';
  } else {
    dom.emptyState.style.display = 'none';
    filtered.forEach((card) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${card.CardID ?? '—'}</td>
        <td>${escapeHtml(shorten(card.Front))}</td>
        <td>${escapeHtml(shorten(card.Back))}</td>
        <td>${resolveDeckName(card.DeckID)}</td>
        <td><span class="badge">${card.Reaction || '—'}</span></td>
        <td class="actions">
          <button class="manager-button danger" data-delete="${card.CardID}">Delete</button>
        </td>
      `;
      dom.tableBody.appendChild(row);
    });
  }

  dom.tableBody.querySelectorAll('[data-delete]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-delete');
      deleteCard(id, button);
    });
  });

  updateStats(filtered.length);
}

function resolveDeckName(deckId) {
  const match = state.decks.find((deck) => String(deck.DeckID) === String(deckId));
  return match ? match.Name : '—';
}

function shorten(text = '', max = 60) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function escapeHtml(text = '') {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function updateStats(visibleCount) {
  if (!dom.stats) return;
  const total = state.cards.length;
  dom.stats.textContent = `${visibleCount} of ${total} cards visible.`;
}

function setLoading(text) {
  if (dom.emptyState) {
    dom.emptyState.textContent = text;
    dom.emptyState.style.display = 'flex';
  }
}

function clearLoading() {
  if (dom.emptyState) {
    dom.emptyState.style.display = 'none';
  }
}

function showMessage(text, type = 'info') {
  if (!dom.message) return;
  dom.message.textContent = text;
  dom.message.dataset.state = type;
  dom.message.className = `manager-message manager-message--${type}`;

  if (messageTimeout) clearTimeout(messageTimeout);
  if (text) {
    messageTimeout = setTimeout(() => {
      dom.message.textContent = '';
      dom.message.className = 'manager-message';
    }, 4000);
  }
}

async function deleteCard(cardId, button) {
  if (!cardId) return;

  button.disabled = true;
  button.textContent = 'Deleting…';

  try {
    const res = await fetch(`/api?id=${cardId}`, { method: 'DELETE' });
    if (!res.ok) {
      throw new Error('Failed to delete card.');
    }
    state.cards = state.cards.filter((card) => String(card.CardID) !== String(cardId));
    renderCards();
    showMessage('Card deleted.', 'success');
  } catch (err) {
    console.error(err);
    showMessage('Unable to delete card.', 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Delete';
  }
}
