let front;
let back;
let reaction = "red";

function setup() {
  createCanvas(windowWidth, windowHeight);
  frontinput = createElement('textarea');
  frontinput.position(100, 50);
  backinput = createElement('textarea');
  backinput.position(100, 100);
}

function draw() {
  background(200);
}

function keyPressed() {
  if (keyCode === 13) {
    front = frontinput.value();
    back = backinput.value();

    addFlashcard(front, back,reaction);
  }
  if (keyCode === 27) {
    window.location.href = "/";
  }
  if (keyCode === 84) {
   fetch("/home")
}
}
function addFlashcard(front, back, reaction) {
  fetch("/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Front: front,
      Back: back,
      Reaction: reaction,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Flashcard added:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
