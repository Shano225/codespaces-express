// Client-side sketch: fetch flashcards from server API
let showDefinition = false;
let currentFront = "";
let currentBack = "";
let currentReaction = "";
let x = 0;
// Do not declare mouseX or mouseY here — p5 provides them globally.
function setup() {
  let mycanvas = createCanvas(windowWidth, windowHeight);
  mycanvas.parent(testdiv);

  // Load initial random card
  fetchRandomCard();

  // Also listen on the window for Escape so a single press works even if the
  // p5 canvas doesn't have keyboard focus.
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      e.preventDefault();
      window.location.href = '/creator';
    }
  });
}


function draw() {
  let cardheight = height * 0.5;
  let cardwidth = width * 0.6;
  background(200);
  rectMode(CENTER);
  fill(50);
  rect(width / 2, height / 2, cardwidth, cardheight);
  fill(220);
  textAlign(CENTER);
  if (showDefinition) {
    textSize(width / 20);
    text(currentBack || "No back text", width / 2, height / 2);
  } else {
    textSize(width / 20);
    text(currentFront || "No front text", width / 2, height / 2);
  }
}

function keyPressed() {
  if (key === "p") {
    fetchRandomCard();
  }
  if (keyCode === 32) {
    showDefinition = !showDefinition;
  }

  if (keyCode === 27) {
    window.location.href = "/creator";
    console.log("Going to Card creator")
  }
}

function mousePressed(fxn) {
  // Toggle definition only if mouse is inside the card area
  let cardheight = height * 0.5;
  let cardwidth = width * 0.6;
  let cardLeft = width / 2 - cardwidth / 2;
  let cardRight = width / 2 + cardwidth / 2;
  let cardTop = height / 2 - cardheight / 2;
  let cardBottom = height / 2 + cardheight / 2;

  if (
    mouseX > cardLeft &&
    mouseX < cardRight &&
    mouseY > cardTop &&
    mouseY < cardBottom
  ) {
    console.log()
    showDefinition = !showDefinition;
  }
}
function fetchRandomCard() {
  fetch("/api/random")
    .then((response) => response.json())
    .then((data) => {
      if (data && data.flashcard) {
        currentFront = data.flashcard.Front || "";
        currentBack = data.flashcard.Back || "";
        currentReaction = data.flashcard.Reaction || "";
      } else {
        currentFront = "No flashcards available";
        currentBack = "";
      }
    })
    .catch((err) => {
      console.error("Failed to fetch random flashcard:", err);
      currentFront = "Error fetching card";
      currentBack = "";
    });
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
window.addEventListener('hashchange', function() {
    if (window.location.hash === '#home') {
        window.location.href = '/';
    }
});