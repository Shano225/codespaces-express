// CardCreatorSketch.js
// Handles the UI and logic for creating new flashcards and decks
// Card creator screen built with p5 + DOM helpers.
// DOM references that the sketch keeps around for quick access.
let frontInput;
let backInput;
let reactionSelect;
let deckSelect;
let submitButton;
let newDeckInput;
let newDeckButton;
let messageEl;
let div;

// Setup function called by p5.js
// Initializes the canvas and UI elements
function setup() {
  div = document.getElementById('mainscreen');

  // p5 canvas blank
  const canvas = createCanvas(1, 1);
  canvas.parent(div);
  canvas.style('display', 'none');

  buildFormUI();
  loadDecks();
  attachGlobalShortcuts();
}

// Draw loop called by p5.js
// Not used in this sketch as it's DOM-based
function draw() {}

// Builds the form UI using p5.dom
// Creates inputs, buttons, and selects
function buildFormUI() {
  // Build the entire form dynamically so it can share styles with the rest of the app.
  const formWrapper = createDiv().addClass('creator-form');
  formWrapper.parent(div);

  createElement('h1', 'Create a flashcard')
    .addClass('creator-title')
    .parent(formWrapper);

  frontInput = createTextareaField('Front', 'What is on the front?', formWrapper);
  backInput = createTextareaField('Back', 'What is on the back?', formWrapper);

  reactionSelect = createSelect();
  reactionSelect.addClass('creator-control');
  reactionSelect.option('Again (show immediately)', 'again');
  reactionSelect.option('Hard', 'hard');
  reactionSelect.option('Unsure', 'unsure');
  reactionSelect.option('Good', 'good');
  reactionSelect.option('Great', 'great');
  appendField('Reaction tag', reactionSelect, formWrapper);

  deckSelect = createSelect();
  deckSelect.addClass('creator-control');
  appendField('Deck', deckSelect, formWrapper);

  const deckField = createDiv().addClass('creator-field');
  deckField.parent(formWrapper);
  createElement('label', 'Create a new deck')
    .addClass('creator-label')
    .parent(deckField);

  const newDeckRow = createDiv().addClass('creator-inline');
  newDeckRow.parent(deckField);

  newDeckInput = createInput('', 'text')
    .attribute('placeholder', 'New deck name')
    .addClass('creator-control')
    .parent(newDeckRow);

  newDeckButton = createButton('Add Deck')
    .addClass('creator-button secondary')
    .parent(newDeckRow);
  newDeckButton.mousePressed(handleCreateDeck);

  submitButton = createButton('Save Card')
    .addClass('creator-button primary')
    .parent(formWrapper);
  submitButton.mousePressed(handleSubmit);

  messageEl = createDiv('')
    .addClass('creator-message')
    .parent(formWrapper);

  showMessage('Fill in the details to create a flashcard.', 'info');
}

// Helper to create a textarea field with label
// label: Label text
// placeholder: Placeholder text
// parent: Parent element
function createTextareaField(label, placeholder, parent) {
  // Helpers stay small and opinionated to keep buildFormUI readable.
  const textarea = createElement('textarea');
  textarea.attribute('placeholder', placeholder);
  textarea.attribute('rows', 4);
  textarea.addClass('creator-control creator-textarea');
  appendField(label, textarea, parent);
  return textarea;
}

// Helper to append a field to a parent element
// labelText: Label text
// element: DOM element to append
// parent: Parent element
function appendField(labelText, element, parent) {
  const wrapper = createDiv().addClass('creator-field');
  wrapper.parent(parent);
  createElement('label', labelText)
    .addClass('creator-label')
    .parent(wrapper);
  element.parent(wrapper);
}

// Fetches decks from the server and populates the dropdown
function loadDecks() {
  // Refresh the deck dropdown with server data.
  if (!deckSelect) return;
  deckSelect.elt.innerHTML = '';
  deckSelect.option('Loading decks...', '');

  fetch('/api/decks')
    .then((res) => res.json())
    .then((data) => {
      deckSelect.elt.innerHTML = '';
      deckSelect.option('Choose a deck', '');
      (data.decks || []).forEach((deck) => {
        deckSelect.option(deck.Name, deck.DeckID);
      });
    })
    .catch((err) => {
      console.error('Failed to load decks:', err);
      deckSelect.option('Unable to load decks', '');
      showMessage('Unable to load decks. Try refreshing.', 'error');
    });
}

// Handles card submission
// Validates input and sends POST request to create card
function handleSubmit() {
  // Client-side validation guards against empty inputs before hitting the server.
  const front = frontInput?.value().trim();
  const back = backInput?.value().trim();
  const deckId = deckSelect?.value();
  const reaction = reactionSelect?.value() || 'again';
  
  console.log('Submitting card with DeckID:', deckId);

  if (!front || !back || !deckId) {
    showMessage('Front, back, and deck are required.', 'error');
    return;
  }

  submitButton.attribute('disabled', true);

  fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Front: front,
      Back: back,
      Reaction: reaction,
      DeckID: Number(deckId)
    })
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Server rejected the card.');
      }
      return res.json();
    })
    .then(() => {
      frontInput.value('');
      backInput.value('');
      showMessage('Flashcard saved!', 'success');
    })
    .catch((err) => {
      console.error('Failed to save card:', err);
      showMessage('Unable to save the card. Please try again.', 'error');
    })
    .finally(() => {
      submitButton.removeAttribute('disabled');
    });
}

// Handles new deck creation
// Validates input and sends POST request to create deck
function handleCreateDeck() {
  // Basic guard to stop empty deck names from hitting the backend.
  const name = newDeckInput?.value().trim();
  if (!name) {
    showMessage('Please enter a deck name.', 'error');
    return;
  }

  newDeckButton.attribute('disabled', true);

  fetch('/api/decks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Name: name,
      Username: localStorage.getItem('username') || 'Anonymous'
    })
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Server rejected the deck.');
      }
      return res.json();
    })
    .then((data) => {
      newDeckInput.value('');
      showMessage(`Deck "${name}" created!`, 'success');
      if (data.DeckID) {
        deckSelect.option(name, data.DeckID);
        deckSelect.value(String(data.DeckID));
      } else {
        loadDecks();
      }
    })
    .catch((err) => {
      console.error('Failed to create deck:', err);
      showMessage('Unable to create deck. Please try again.', 'error');
    })
    .finally(() => {
      newDeckButton.removeAttribute('disabled');
    });
}

// Displays a message to the user
// text: Message text
// type: 'info', 'success', 'error'
function showMessage(text, type = 'info') {
  // Swap CSS classes instead of inline styles so the page theme can decide colors.
  if (!messageEl) return;
  messageEl.html(text);
  messageEl.removeClass('message-info');
  messageEl.removeClass('message-success');
  messageEl.removeClass('message-error');
  messageEl.addClass(`message-${type}`);
}

// Attaches global keyboard shortcuts
// Escape to go home
function attachGlobalShortcuts() {
  // Escape returns to home; hashchange matches the behavior on other sketches.
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      e.preventDefault();
      window.location.href = '/home';
    }
  });

  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#home') {
      window.location.href = '/home';
    }
  });
}

function windowResized() {}
