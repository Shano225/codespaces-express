// public/javascripts/sketch.js
// Simple client-side sketch and helper for adding flashcards via the API.
// Uses fetch() to POST new flashcards and p5-style functions for drawing.

// Send a new flashcard to the server API.
function addFlashcard(front, back, reaction) {
  fetch('/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      Front: front,
      Back: back,
      Reaction: reaction
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Flashcard added:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}


// Example state used by the sketch. `vv` is a sample front text.
let vv = "test";
let x = 0;
let input;
let showDefinition = false;

// p5.js setup function: create input and canvas
function setup() {
  input = createInput('');
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(24);
}

// p5.js draw loop: render a card and optionally show the input value
function draw() {
  rectMode(CENTER);
  rect(windowWidth/2, windowHeight/2, 750, 250);

  if (showDefinition) {
    textSize(18);
    // show the current content of the input field
    text(input, width / 2, height / 2);
  } else {
    textSize(32);
    text("Interest", width / 2, height / 2);
  }
}

// Toggle the definition and POST a demo flashcard when the canvas is clicked
function mousePressed() {
  x++;
  addFlashcard(vv, 'The cost of borrowing money.', 'Learned');
  showDefinition = !showDefinition;
}

// Resize canvas if window is resized
// Keep the canvas sized to the window
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}