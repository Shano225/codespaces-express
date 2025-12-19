// CardScreenSketch.js
// Main flashcard study screen using p5.js
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

// Setup function called by p5.js
// Initializes canvas, UI, and loads data
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

// Draw loop called by p5.js
// Renders the card or status message
function draw() {
  background(246, 247, 249);
  if (!currentCardId) {
    drawStatusMessage(statusMessage);
  } else {
    drawCard();
  }
  drawInstructions();
}

// Handles key press events
// Navigation, flipping, and exit
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

// Handles mouse press events
// Flipping card on click
function mousePressed() {
  const { cardLeft, cardRight, cardTop, cardBottom } = getCardBounds();
  const insideCard = mouseX > cardLeft && mouseX < cardRight && mouseY > cardTop && mouseY < cardBottom;
  if (insideCard) {
    showDefinition = !showDefinition;
  }
}

// Fetches decks and cards from the server
// Initializes the spaced repetition engine
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

// Populates the deck selection dropdown
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

// Loads a specific deck of cards
// cards: Array of card objects
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

// Handles window resize events
// Resizes the canvas
function windowResized() {
  const { width: w, height: h } = getContainerSize();
  resizeCanvas(w, h);
}
window.addEventListener('hashchange', function() {
    if (window.location.hash === '#home') {
        window.location.href = '/';
    }
});

// Draws the current flashcard
// Renders front/back text and reaction badge
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

// Draws instructions at the bottom of the screen
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

// Helper to draw a label (Front/Back)
function drawLabel(textValue, x, y) {
  push();
  textAlign(CENTER, CENTER);
  textSize(14);
  fill(80);
  text(textValue, x, y);
  pop();
}

// Helper to draw a reaction badge
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

// Calculates the bounds of the card
// Returns an object with left, right, top, bottom
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

// Gets the size of the container element
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

// Draws centered multiline text
// textValue: Text to draw
// centerX, centerY: Center coordinates
// maxWidth, maxHeight: Maximum dimensions
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

// Sets up reaction button event listeners
function setupReactionButtons() {
  reactionButtons = Array.from(document.querySelectorAll('[data-reaction-btn]'));
  reactionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const reaction = button.getAttribute('data-reaction-btn');
      handleReactionChoice(reaction);
    });
  });
}

// Handles a user's reaction choice
// Records reaction and moves to next card
function handleReactionChoice(reaction) {
  if (!reaction || !currentCardId) return;
  lastReactionChoice = reaction;
  setActiveReactionButton(reaction);
  if (spacedEngine) {
    spacedEngine.recordReaction(currentCardId, reaction);
  }
  goToNextCard(true);
}

// Updates the active state of reaction buttons
function setActiveReactionButton(reaction) {
  reactionButtons.forEach((button) => {
    const isActive = button.getAttribute('data-reaction-btn') === reaction && reaction !== '';
    button.classList.toggle('active', isActive);
  });
}

// Formats a reaction string for display
function formatReactionLabel(reaction) {
  if (!reaction) return '';
  return reaction.charAt(0).toUpperCase() + reaction.slice(1);
}

// Sets up arrow button event listeners
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

// Navigates to the next card
// forceSample: Whether to force sampling a new card instead of history
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

// Navigates to the previous card in history
function goToPreviousCard() {
  if (historyIndex <= 0) return;
  historyIndex -= 1;
  const card = cardsMap.get(history[historyIndex]);
  if (card) {
    applyCard(card, true);
  }
}

// Applies the current card data to the UI state
// card: The card object to display
// keepDefinition: Whether to keep the definition side shown
function applyCard(card, keepDefinition = false) {
  currentCardId = resolveCardId(card);
  currentFront = card?.Front || '';
  currentBack = card?.Back || '';
  currentReaction = card?.Reaction || '';
  showDefinition = keepDefinition ? showDefinition : false;
  statusMessage = '';
  setActiveReactionButton('');
}

// Resolves a unique ID for a card
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

// Draws a status message in the center of the screen
function drawStatusMessage(textValue) {
  push();
  fill(90);
  textAlign(CENTER, CENTER);
  textSize(16);
  text(textValue, width / 2, height / 2);
  pop();
}
// Sets up the deck selector event listener
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
