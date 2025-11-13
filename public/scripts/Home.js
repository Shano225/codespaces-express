// Placeholder p5 sketch used to render basic shapes/search on the Home page.
let Searchval;
if (
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
) {
  closedstate = 0.75;
}
function setup() {
  div = document.getElementById("mainscreen");
  let z = createCanvas(div.clientWidth, div.clientHeight);
  Search = createElement("Input");
  Search.position(div.clientWidth / 1.05, div.clientHeight / 10);
  Search.size(div.clientWidth / 6, div.clientHeight / 25);
  z.parent(mainscreen);
}
function keyPressed() {
  if (keyCode === 13) {
    Searchval = Search.value();
  }
}

function draw() {
  background(202);
  rectMode(CENTER);
  for (let i = 1; i < 5; i++) {
    rect(
      div.clientWidth / 7,
      height / 2,
      div.clientWidth * 0.2,
      div.clientHeight * 0.7
    );
  }
}

window.addEventListener("hashchange", function () {
  if (window.location.hash === "#home") {
    window.location.href = "/";
  }
});

function windowResized() {
  div = document.getElementById("mainscreen");
  resizeCanvas(div.clientWidth, div.clientHeight);
}
function mouseMoved() {}
