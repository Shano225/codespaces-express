// Client-side sketch: fetch flashcards from server API and apply spaced repetition.
let showDefinition = false;
let currentFront = '';
let currentBack = '';
let currentReaction = '';
let currentCardId = null;
let container;
let lastReactionChoice = '';
let reactionButtons = [];
let arrowButtons = [];
let spacedEngine = null;
let cardsMap = new Map();
let history = [];
let historyIndex = -1;
let statusMessage = 'Loading cards…';
let deckSelect;
let availableDecks = [];
let selectedDeckId = '';

function setup() {
  container = document.getElementById('mainscreen');
  const { width: w, height: h } = getContainerSize();
  const canvas = createCanvas(w, h);
  canvas.parent(container);
  textFont('Arial');
  deckSelect = document.getElementById('deckSelect');
  loadDecks();
  setupReactionButtons();
  setupArrowButtons();
  setupDeckSelector();

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      e.preventDefault();
      window.location.href = '/';
    }
  });
}

function draw() {
  background(246, 247, 249);
  if (!currentCardId) {
    drawStatusMessage(statusMessage);
  } else {
    drawCard();
  }
  drawInstructions();
}

function keyPressed() {
  if (key === 'p' || keyCode === RIGHT_ARROW) {
    goToNextCard(true);
  } else if (keyCode === LEFT_ARROW) {
    goToPreviousCard();
  } else if (keyCode === 32) {
    showDefinition = !showDefinition;
  } else if (keyCode === 27) {
    window.location.href = '/';
  }
}

function mousePressed() {
  const { cardLeft, cardRight, cardTop, cardBottom } = getCardBounds();
  const insideCard = mouseX > cardLeft && mouseX < cardRight && mouseY > cardTop && mouseY < cardBottom;
  if (insideCard) {
    showDefinition = !showDefinition;
  }
}

function loadDecks() {
  if (deckSelect) {
    deckSelect.innerHTML = '<option value="">Loading decks…</option>';
  }

  Promise.all([
    fetch('/api/decks').then((res) => res.json()),
    fetch('/api').then((res) => res.json())
  ])
    .then(([deckData, cardData]) => {
      availableDecks = deckData.decks || [];
      populateDeckSelect();
      loadDeck(cardData.flashcards || []);
    })
    .catch((err) => {
      console.error('Failed to load decks/cards:', err);
      statusMessage = 'Unable to load decks. Try refreshing.';
    });
}

function populateDeckSelect() {
  if (!deckSelect) return;
  deckSelect.innerHTML = '';
  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = 'All decks';
  deckSelect.appendChild(allOption);

  availableDecks.forEach((deck) => {
    const option = document.createElement('option');
    option.value = deck.DeckID;
    option.textContent = deck.Name;
    deckSelect.appendChild(option);
  });
}

function loadDeck(cards) {
  const filtered = selectedDeckId
    ? cards.filter((card) => String(card.DeckID) === String(selectedDeckId))
    : cards;

  cardsMap.clear();
  filtered.forEach((card, index) => {
    const id = resolveCardId(card, index);
    cardsMap.set(id, card);
  });

  if (!filtered.length) {
    spacedEngine = null;
    currentCardId = null;
    currentFront = 'No cards in this deck';
    currentBack = '';
    statusMessage = 'No cards in this deck.';
    return;
  }

  spacedEngine = new BasicSpacedRepetition(filtered);
  history = [];
  historyIndex = -1;
  goToNextCard(true);
}

function windowResized() {
  const { width: w, height: h } = getContainerSize();
  resizeCanvas(w, h);
}
window.addEventListener('hashchange', function() {
    if (window.location.hash === '#home') {
        window.location.href = '/';
    }
});

function drawCard() {
  const cardWidth = Math.min(width * 0.8, 700);
  const cardHeight = Math.min(height * 0.65, 420);
  const cardX = width / 2;
  const cardY = height / 2 - 20;



  push();
  rectMode(CENTER);
  stroke(230);
  strokeWeight(2);
  fill(255);
  rect(cardX, cardY, cardWidth, cardHeight, 18);
  pop();

  const label = showDefinition ? 'Back' : 'Front';
  drawLabel(label, cardX, cardY - cardHeight / 2 + 30);

  if (currentReaction) {
    drawBadge(currentReaction, cardX, cardY + cardHeight / 2 - 30);
  }

  const content = showDefinition ? currentBack : currentFront;
  const fallback = showDefinition ? 'No back text' : 'No front text';
  drawCenteredMultiline(content || fallback, cardX, cardY, cardWidth - 80, cardHeight - 120);
}

function drawInstructions() {
  push();
  fill(90);
  textAlign(CENTER);
  textSize(14);
  const textLines = 'Click/Space: Flip • ←/→ or P: Navigate • Esc: Home';
  text(textLines, width / 2, height - 36);
  const reactionInfo = lastReactionChoice
    ? `Last choice: ${formatReactionLabel(lastReactionChoice)}`
    : 'Use a reaction button below to keep moving.';
  text(reactionInfo, width / 2, height - 16);
  pop();
}

function drawLabel(textValue, x, y) {
  push();
  textAlign(CENTER, CENTER);
  textSize(14);
  fill(80);
  text(textValue, x, y);
  pop();
}

function drawBadge(reaction, x, y) {
  const label = formatReactionLabel(reaction);
  push();
  textSize(14);
  textAlign(CENTER, CENTER);
  const paddingX = 18;
  const paddingY = 10;
  const textWidthValue = textWidth(label);
  const badgeWidth = textWidthValue + paddingX;
  const badgeHeight = 28;
  rectMode(CENTER);
  fill(240);
  stroke(210);
  rect(x, y, badgeWidth, badgeHeight, 14);
  noStroke();
  fill(60);
  text(label, x, y + 1);
  pop();
}

function getCardBounds() {
  const cardWidth = Math.min(width * 0.8, 700);
  const cardHeight = Math.min(height * 0.65, 420);
  return {
    cardLeft: width / 2 - cardWidth / 2,
    cardRight: width / 2 + cardWidth / 2,
    cardTop: height / 2 - cardHeight / 2 - 20,
    cardBottom: height / 2 + cardHeight / 2 - 20
  };
}

function getContainerSize() {
  if (!container) {
    return { width: windowWidth, height: windowHeight };
  }
  const rect = container.getBoundingClientRect();
  return {
    width: rect.width || windowWidth,
    height: rect.height || windowHeight
  };
}

function drawCenteredMultiline(textValue, centerX, centerY, maxWidth, maxHeight) {
  push();
  textAlign(CENTER, CENTER);
  const fontSize = constrain(maxWidth / 12, 20, 40);
  textSize(fontSize);
  fill(34);
  const lineHeight = fontSize * 1.3;
  const words = (textValue || '').split(/\s+/);
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const tentative = currentLine ? `${currentLine} ${word}` : word;
    if (textWidth(tentative) <= maxWidth || !currentLine) {
      currentLine = tentative;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) {
    lines.push(currentLine);
  }

  const maxLines = Math.max(1, Math.floor(maxHeight / lineHeight));
  const displayLines = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    const lastIndex = displayLines.length - 1;
    displayLines[lastIndex] = `${displayLines[lastIndex]}…`;
  }

  const totalHeight = displayLines.length * lineHeight;
  let lineY = centerY - totalHeight / 2 + lineHeight / 2;
  displayLines.forEach((line) => {
    text(line, centerX, lineY);
    lineY += lineHeight;
  });
  pop();
}

function setupReactionButtons() {
  reactionButtons = Array.from(document.querySelectorAll('[data-reaction-btn]'));
  reactionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const reaction = button.getAttribute('data-reaction-btn');
      handleReactionChoice(reaction);
    });
  });
}

function handleReactionChoice(reaction) {
  if (!reaction || !currentCardId) return;
  lastReactionChoice = reaction;
  setActiveReactionButton(reaction);
  if (spacedEngine) {
    spacedEngine.recordReaction(currentCardId, reaction);
  }
  goToNextCard(true);
}

function setActiveReactionButton(reaction) {
  reactionButtons.forEach((button) => {
    const isActive = button.getAttribute('data-reaction-btn') === reaction && reaction !== '';
    button.classList.toggle('active', isActive);
  });
}

function formatReactionLabel(reaction) {
  if (!reaction) return '';
  return reaction.charAt(0).toUpperCase() + reaction.slice(1);
}

function setupArrowButtons() {
  arrowButtons = Array.from(document.querySelectorAll('[data-arrow]'));
  arrowButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const direction = button.getAttribute('data-arrow');
      if (direction === 'prev') {
        goToPreviousCard();
      } else if (direction === 'next') {
        goToNextCard(true);
      }
    });
  });
}

function goToNextCard(forceSample = false) {
  if (!spacedEngine) return;

  if (!forceSample && historyIndex < history.length - 1) {
    historyIndex += 1;
    const card = cardsMap.get(history[historyIndex]);
    if (card) {
      applyCard(card);
      return;
    }
  }

  const nextCard = spacedEngine.sample();
  if (!nextCard) {
    statusMessage = 'No flashcards available.';
    currentCardId = null;
    return;
  }

  if (historyIndex < history.length - 1) {
    history = history.slice(0, historyIndex + 1);
  }
  history.push(resolveCardId(nextCard, history.length));
  historyIndex = history.length - 1;
  applyCard(nextCard);
}

function goToPreviousCard() {
  if (historyIndex <= 0) return;
  historyIndex -= 1;
  const card = cardsMap.get(history[historyIndex]);
  if (card) {
    applyCard(card, true);
  }
}

function applyCard(card, keepDefinition = false) {
  currentCardId = resolveCardId(card);
  currentFront = card?.Front || '';
  currentBack = card?.Back || '';
  currentReaction = card?.Reaction || '';
  showDefinition = keepDefinition ? showDefinition : false;
  statusMessage = '';
  setActiveReactionButton('');
}

function resolveCardId(card, fallbackIndex = 0) {
  if (!card) {
    return `card-${fallbackIndex}`;
  }
  if (card._resolvedId) {
    return card._resolvedId;
  }
  const resolved =
    card?.CardID ??
    card?.cardId ??
    card?.id ??
    card?.ID ??
    `card-${fallbackIndex}`;
  card._resolvedId = resolved;
  return resolved;
}

function drawStatusMessage(textValue) {
  push();
  fill(90);
  textAlign(CENTER, CENTER);
  textSize(16);
  text(textValue, width / 2, height / 2);
  pop();
}
function setupDeckSelector() {
  if (!deckSelect) return;
  deckSelect.addEventListener('change', () => {
    selectedDeckId = deckSelect.value;
    statusMessage = 'Loading cards…';
    fetch('/api')
      .then((res) => res.json())
      .then((data) => {
        loadDeck(data.flashcards || []);
      })
      .catch((err) => {
        console.error('Failed to reload cards:', err);
        statusMessage = 'Unable to load cards for deck.';
      });
  });
}
