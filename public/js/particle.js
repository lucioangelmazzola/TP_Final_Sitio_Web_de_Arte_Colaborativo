let partImgs = [];
let par = [];
const CANTIDAD_PARTICLES = 16;

function preload() {
    partImgs.push(loadImage('/public/img/Calabaza03.gif'));
    partImgs.push(loadImage('/public/img/Calabaza02.gif'));
    partImgs.push(loadImage('/public/img/Calabaza01.gif'));
    partImgs.push(loadImage('/public/img/Arana.gif'));
    partImgs.push(loadImage('/public/img/Telarana.gif'));
    partImgs.push(loadImage('/public/img/Murcielago01.gif'));
    partImgs.push(loadImage('/public/img/Murcielago02.gif'));
}

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-particulas');
    canvas.style('display', 'block');

    for (let i = 0; i < CANTIDAD_PARTICLES; i++) {
        par.push(new Particle());
    }
}

function draw() {
    clear(); // Mantiene el canvas transparente para que se vea tu fondo.jpeg

    for (let p of par) {
        p.update();
        p.draw();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// --- Tu clase original ---
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = random(width);
        this.y = random(height);
        this.img = random(partImgs);
        this.timer = int(random(80, 300));
        this.wait = int(random(90, 300));
        this.visible = false;
    }

    update() {
        if (this.visible) {
            this.timer--;
            if (this.timer <= 0) {
                this.visible = false;
            }
        } else {
            this.wait--;
            if (this.wait <= 0) {
                this.reset();
                this.visible = true;
            }
        }
    }

    draw() {
        if (!this.visible) return;
        image(this.img, this.x, this.y, 280, 186);
    }
}