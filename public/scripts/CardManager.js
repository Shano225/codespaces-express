let currentFront = "";
let currentBack = ""; let cardamount = 60
function draw() {
    background(200);
    rectMode(CENTER);
    for (i = 0; i < cardamount; i++) {
        rect(width / 3.1 * i, 100, width / 3.2, 300)
    }
    textAlign(CENTER);
    if (showDefinition) {
        textSize(width / 20);
        text(currentBack || "No back text", width / 2, height / 2);
    } else {
        textSize(width / 20);
        text(currentFront || "No front text", width / 2, height / 2);
    } background(200)


}

function setup() {
    createCanvas(windowWidth, windowHeight);

}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
window.addEventListener('hashchange', function () {
    if (window.location.hash === '#home') {
        window.location.href = '/';
    }
});