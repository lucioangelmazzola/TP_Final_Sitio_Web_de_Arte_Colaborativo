// Clase para que los GIF aparezcan aleatoriamente en la pantalla
let partImgs = [];
let par = [];
const CANTIDAD_PARTICLES = 16;

function preload() {
    let calabaza3 = loadImage('/public/img/Calabaza03.gif');
    let calabaza2 = loadImage('/public/img/Calabaza02.gif');
    let calabaza1 = loadImage('/public/img/Calabaza01.gif');
    let arana = loadImage('/public/img/Arana.gif');
    let telarana = loadImage('/public/img/Telarana.gif');
    let murcielago1 = loadImage('/public/img/Murcielago01.gif');
    let murcielago2 = loadImage('/public/img/Murcielago02.gif');

    partImgs.push(calabaza2, calabaza2, calabaza2, calabaza2);
    partImgs.push(calabaza1, calabaza1, calabaza1, calabaza1);
    partImgs.push(arana, arana, arana, arana);
    partImgs.push(murcielago1, murcielago1, murcielago1, murcielago1);
    partImgs.push(murcielago2, murcielago2, murcielago2);
    partImgs.push(telarana, telarana, telarana, telarana);
    partImgs.push(calabaza3);
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
    clear(); // Mantiene el canvas transparente

    for (let p of par) {
        p.update();
        p.draw();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

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