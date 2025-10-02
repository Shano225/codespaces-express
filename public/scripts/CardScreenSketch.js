// Client-side sketch: fetch flashcards from server API
let showDefinition = false;
let currentFront = ""; 
let currentBack = "";
let currentReaction = "";
let x = 0;
let testarray = ["word1","word2","word3","word4"]
function setup(){
    let mycanvas = createCanvas(windowWidth, windowHeight)
    mycanvas.parent(testdiv)
   
    // Load initial random card
    fetchRandomCard();
}
function draw(){ 
  background(200)
    rectMode(CENTER)
    rect(width/2,height/2, 500, 150)
    fill(250)
    textAlign(CENTER);
    if (showDefinition) {
      textSize(18);
      text(currentBack || 'No back text', width / 2, height / 2);
    } else {
      textSize(32);
      text(currentFront || 'No front text', width / 2, height / 2);
    }
}



function keyPressed(){
  x++;
  if (key==='c'){
  showDefinition = !showDefinition;}


  if (key==='v'){
  addFlashcard("test1","test2","good")}
  if (!showDefinition) {
    fetchRandomCard();
  }

}

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
 

function fetchRandomCard() {
  fetch('/api/random')
    .then(response => response.json())
    .then(data => {
      if (data && data.flashcard) {
        currentFront = data.flashcard.Front || '';
        currentBack = data.flashcard.Back || '';
        currentReaction = data.flashcard.Reaction || '';
      } else {
        currentFront = 'No flashcards available';
        currentBack = '';
      }
    })
    .catch(err => {
      console.error('Failed to fetch random flashcard:', err);
      currentFront = 'Error fetching card';
      currentBack = '';
    });
}
function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}