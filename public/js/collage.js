const contenedorCollage = document.getElementById('contenedor-canvas-p5');

if (contenedorCollage) {
    // Pide los datos necesarios
    fetch('/obra/data')
        .then(respuesta => respuesta.json())
        .then(datos => {
            iniciarSketchCollage(datos);
        })
        .catch(err => console.error('Error cargando datos del collage:', err));
}

function iniciarSketchCollage(datos) {
    new p5((p) => {
        let piezas = [];

        p.setup = () => {
            let ancho = Math.min(window.innerWidth - 40, 1000);
            let alto = 600;
            let canvas = p.createCanvas(ancho, alto);
            canvas.parent('contenedor-canvas-p5');
            p.imageMode(p.CENTER);
            p.angleMode(p.DEGREES);

            // Carga cada imagen de la base de datos
            for (let item of datos) {
                let ruta = '/uploads/' + item.filehash;
                p.loadImage(ruta, (imgCargada) => {
                    piezas.push({
                        img: imgCargada,
                        autor: item.username,
                        x: p.random(120, p.width - 120),
                        y: p.random(120, p.height - 120),
                        targetX: p.random(120, p.width - 120),
                        targetY: p.random(120, p.height - 120),
                        angulo: p.random(-20, 20),
                        targetAngulo: p.random(-20, 20),
                        w: 180,
                        h: 180
                    });
                });
            }
        };

        function PosicionesR() {
            for (let pieza of piezas) {
                pieza.targetX = p.random(120, p.width - 120);
                pieza.targetY = p.random(120, p.height - 120);
                pieza.targetAngulo = p.random(-20, 20);
            }
        }

        p.draw = () => {
            // Cuadro blanco de fondo
            p.background('rgb(102, 99, 99)');

            // Cambia las posiciones automáticamente cada 5 segundos (300 frames)
            if (p.frameCount % 300 === 0) {
                PosicionesR();
            }

            for (let pieza of piezas) {
                // Movimiento suave
                pieza.x = p.lerp(pieza.x, pieza.targetX, 0.05);
                pieza.y = p.lerp(pieza.y, pieza.targetY, 0.05);
                pieza.angulo = p.lerp(pieza.angulo, pieza.targetAngulo, 0.05);

                p.push();
                p.translate(pieza.x, pieza.y);
                p.rotate(pieza.angulo);

                // Borde blanco
                p.fill(250);
                p.stroke(210);
                p.rect(-pieza.w / 2 - 6, -pieza.h / 2 - 6, pieza.w + 12, pieza.h + 26, 4);

                p.image(pieza.img, 0, 0, pieza.w, pieza.h);

                // Nombre del usuario debajo de la foto
                p.fill(40);
                p.noStroke();
                p.textAlign(p.CENTER);
                p.textSize(12);
                p.text('@' + pieza.autor, 0, pieza.h / 2 + 14);
                p.pop();
            }
        };

        // Al hacer clic sobre el cuadro blanco, mezcla las fotos al instante
        p.mousePressed = () => {
            if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
                PosicionesR();
            }
        };
    });
}