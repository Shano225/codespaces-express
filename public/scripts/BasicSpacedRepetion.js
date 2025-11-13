// Base bump amounts for each reaction type.
// Basic spaced repetition helper that tracks probability weights for cards.
const DEFAULT_REACTION_IMPACT = {
  again: 0.25,
  hard: 0.15,
  unsure: 0.1,
  default: 0.12
};

class BasicSpacedRepetition {
  constructor(cards = [], options = {}) {
    // Allow overriding the reaction deltas and minimum probability floor.
    this.reactionImpact = { ...DEFAULT_REACTION_IMPACT, ...(options.reactionImpact || {}) };
    this.minProbability = Math.max(options.minProbability ?? 0, 0);
    this.entries = [];
    this.setCards(cards);
  }

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

  getDistribution() {
    // Expose a copy so UIs can render the current per-card probabilities.
    return this.entries.map((entry) => ({
      id: entry.id,
      card: entry.card,
      probability: Number(entry.probability.toFixed(6))
    }));
  }

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

  _resolveImpact(reaction) {
    if (typeof reaction === 'number' && !Number.isNaN(reaction)) return reaction;
    const key = reaction ? String(reaction).toLowerCase() : 'default';
    return this.reactionImpact[key] ?? this.reactionImpact.default;
  }

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
