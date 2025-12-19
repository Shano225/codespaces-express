// BasicSpacedRepetition.js
// Implements a weighted random selection algorithm for spaced repetition
// Base bump amounts for each reaction type.
// Basic spaced repetition helper that tracks probability weights for cards.
const DEFAULT_REACTION_IMPACT = {
  again: 0.25,
  hard: 0.15,
  unsure: 0.1,
  default: 0.12
};

class BasicSpacedRepetition {
  // Constructor initializes the spaced repetition engine
  // cards: Array of card objects
  // options: Configuration options (reactionImpact, minProbability)
  constructor(cards = [], options = {}) {
    // Allow overriding the reaction deltas and minimum probability floor.
    this.reactionImpact = { ...DEFAULT_REACTION_IMPACT, ...(options.reactionImpact || {}) };
    this.minProbability = Math.max(options.minProbability ?? 0, 0);
    this.entries = [];
    this.setCards(cards);
  }

  // Sets the list of cards and resets probabilities
  // cards: Array of card objects to manage
  setCards(cards = []) {
    // Reset to a uniform distribution: every card starts with equal weight.
    const list = Array.isArray(cards) ? cards : [];
    const base = list.length ? 1 / list.length : 0;

    this.entries = list.map((card, index) => ({
      id: this._resolveId(card, index),
      card,
      probability: base
    }));
  }

  // Returns the current probability distribution
  // Useful for visualizing or debugging card weights
  getDistribution() {
    // Expose a copy so UIs can render the current per-card probabilities.
    return this.entries.map((entry) => ({
      id: entry.id,
      card: entry.card,
      probability: Number(entry.probability.toFixed(6))
    }));
  }

  // Selects a card based on weighted probability
  // Returns the selected card object
  sample() {
    // Weighted random draw using cumulative probability.
    if (!this.entries.length) return null;
    const r = Math.random();
    let cumulative = 0;

    for (const entry of this.entries) {
      cumulative += entry.probability;
      if (r <= cumulative) return entry.card;
    }

    return this.entries[this.entries.length - 1].card;
  }

  // Updates the probability of a card based on user reaction
  // cardId: ID of the card being reacted to
  // reaction: 'again', 'hard', 'unsure', 'good', 'great'
  recordReaction(cardId, reaction) {
    // Increase the probability of the reacted card, then renormalize to keep sum=1.
    const entry = this.entries.find((item) => item.id === cardId);
    if (!entry) return null;

    entry.probability = Math.max(
      this.minProbability,
      entry.probability + this._resolveImpact(reaction)
    );

    this._normalize();
    return entry.card;
  }

  // Normalizes probabilities so they sum to 1
  // Internal helper function
  _normalize() {
    // Divide each probability by the total to remove any drift.
    const total = this.entries.reduce((sum, entry) => sum + entry.probability, 0);
    if (!total) {
      const base = this.entries.length ? 1 / this.entries.length : 0;
      this.entries.forEach((entry) => {
        entry.probability = base;
      });
      return;
    }

    this.entries.forEach((entry) => {
      entry.probability /= total;
    });
  }

  // Determines the probability impact of a reaction
  // Internal helper function
  _resolveImpact(reaction) {
    if (typeof reaction === 'number' && !Number.isNaN(reaction)) return reaction;
    const key = reaction ? String(reaction).toLowerCase() : 'default';
    return this.reactionImpact[key] ?? this.reactionImpact.default;
  }

  // Resolves a unique ID for a card
  // Internal helper function
  _resolveId(card, index) {
    const candidate = card?.CardID ?? card?.cardId ?? card?.id ?? card?.ID;
    return candidate ?? `card-${index}`;
  }
}

if (typeof window !== 'undefined') {
  window.BasicSpacedRepetition = BasicSpacedRepetition;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BasicSpacedRepetition;
}
