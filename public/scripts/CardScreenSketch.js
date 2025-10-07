// Client-side sketch: fetch flashcards from server API
let showDefinition = false;
let currentFront = ""; 
let currentBack = "";
let currentReaction = "";
let x = 0;
function setup(){
    let mycanvas = createCanvas(windowWidth, windowHeight)
    mycanvas.parent(testdiv)
   
    // Load initial random card
    fetchRandomCard();
}
function draw(){ 
  background(200)
    rectMode(CENTER)
    fill(50)
    rect(width/2,height/2, width*0.6, height*0.5)
    fill(220)
    textAlign(CENTER);
    if (showDefinition) {
      textSize(width/20);
      text(currentBack || 'No back text', width / 2, height / 2);
    } else {
      textSize(width/20);
      text(currentFront || 'No front text', width / 2, height / 2);
    }
}



function keyPressed(){

if (key ==="p"){
  if (!showDefinition) {
    fetchRandomCard();}
  showDefinition = !showDefinition;}


  if (keyCode === 27){
    fetch('/creator')
  }
  
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