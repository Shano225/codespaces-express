let front;
let back;
let reaction = "red";
let textinput
let backinput
let htmlDeckSelect
let submitButton
let messageEl
let div;

function setup() {
  // find the container first, then create a canvas sized to it
  div = document.getElementById("mainscreen");
  let z = createCanvas(div.clientWidth, div.clientHeight);
  // attach the p5 canvas into the mainscreen div
  z.parent(div);
  rectMode(CENTER)
  textinput = createElement('textarea');
  textinput.position(div.clientWidth / 2+130-width / 6.4, div.clientHeight/2-150);
  textinput.size(div.clientWidth / 3.2, 300)
  textinput.style("resize:none")


  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      e.preventDefault();
      console.log('Escape pressed - navigating to Card Viewer');
      window.location.href = '/';
    }
  })
}

function draw() {
  background(200);
}




function windowResized() {
  // keep canvas sized to the mainscreen container
  textinput.position(div.clientWidth / 2+130-width / 6.4, div.clientHeight/2-150);
  
  if (div) resizeCanvas(div.clientWidth, div.clientHeight);
  textinput.size(width / 3.2, 300)

}
window.addEventListener('hashchange', function () {
  if (window.location.hash === '#home') {
    window.location.href = '/';
  }
});