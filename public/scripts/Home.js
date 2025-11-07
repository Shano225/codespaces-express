let Searchval
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    closedstate = 0.75

}
function setup() {
    div=document.getElementById("mainscreen")
    let z = createCanvas(div.clientWidth, div.clientHeight);
    Search = createElement('Input');
    Search.position(width / 1.23, 31)
    Search.size(width / 6, windowHeight * 0.04)
    z.parent(mainscreen)

}
function keyPressed() {
    if (keyCode === 13) {
        Searchval = Search.value();
    }
}

function draw() {
    background(102, 168, 50);
    rectMode(CENTER)
    rect(width / 2, height / 2, 100, 100)


}

window.addEventListener('hashchange', function () {
    if (window.location.hash === '#home') {
        window.location.href = '/';
    }
});




function windowResized() {
     div=document.getElementById("mainscreen")
    resizeCanvas(div.clientWidth, div.clientHeight);
}
function mouseMoved() { }

