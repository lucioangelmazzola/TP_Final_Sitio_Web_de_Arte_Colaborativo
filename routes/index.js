const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database/db.js');

const router = express.Router();


/**
 * En app.js se insertan estas rutas en '/'
 * con la expresión:
 *
 * app.use("/", indexRouter);
 *
 * En este caso, las rutas de este archivo son
 * relativas a la ruta raíz, ver el caso de users.js
 * que es distinto.
 */


router.get('/', (req, res, next) => {
    // Página principal del sitio.
    res.render('index', { pageTitle: 'Página principal' });
});


/**
 * About
 */

router.get('/about', (req, res, next) => {
    // Información sobre el sitio.
    res.render('about', { pageTitle: 'About' });
});


/**
 * Middleware para login y signup con get y post.
 * Comprueba que el usuario no esté logueado para poder
 * acceder a las rutas.
 */
function notlogged(req, res, next) {
    // Si el usuario no está logueado, continúa.
    if(!req.session.user) {
        next();
    } else {
        res.redirect('/user');
    }
}


/**
 * Signup
 */

router.get('/signup', notlogged, (req, res, next) => {
    // Enviar el formulario.
    res.render('signup', { pageTitle: 'Registrarse' });
});

router.post('/signup', notlogged, (req, res, next) => {
    const { username, email, password } = req.body;

    if(db.userExists(username)) {
        res.send('Error: El nombre de usuario ya existe');
        return
    }

    const hash = bcrypt.hashSync(password, 10);
    db.addUser(username, email, hash);

    // Recibir y procesa los datos del formulario, redirecciona al logueo.
    res.redirect('/login');
});


/**
 * Login
 */

function authenticate(username, password) {
    if (!db.userExists(username)) return false
    const hash = db.getHash(username);
    const ok = bcrypt.compareSync(password, hash);
    if (ok) return true
    else return false
}

router.get('/login', notlogged, (req, res, next) => {
    res.render('login', { pageTitle: 'Logueo' });
});

router.post('/login', notlogged, (req, res, next) => {
    const { username, password } = req.body;
    const ok = authenticate(username, password);

    if(ok) {
        req.session.regenerate(() => {
            req.session.user = username;
            req.session.success = `Autenticado como ${username}`;
            res.redirect('/user');
        });
    } else {
        req.session.error = 'La autenticación falló, revise su nombre de usuario y contraseña';
        res.redirect('/login');
    }

    // Log para ver los datos de la base de datos *** BORRAR.
    db.log();
});

const monstruos = {
    vampiro: {
        titulo: 'EL VAMPIRO',
        imagen: '/public/img/test01.png',
        descripcion: 'Elegante, misterioso y seductor. Dominás la noche con astucia y siempre tenés todo bajo control.'
    },
    licantropo: {
        titulo: 'EL HOMBRE LOBO',
        imagen: '/public/img/test01.png',
        descripcion: 'Impulsivo, leal y feroz. Llevás una fuerza indomable por dentro que despierta cuando nadie lo espera.'
    },
    fantasma: {
        titulo: 'EL ESPECTRO',
        imagen: '/public/img/test01.png',
        descripcion: 'Silencioso, observador y melancólico. Te movés sin hacer ruido y sabés todos los secretos de los demás.'
    },
    demonio: {
        titulo: 'EL DEMONIO',
        imagen: '/public/img/test01.png',
        descripcion: 'Intenso, rebelde y temible. No seguís las reglas de nadie y disfrutás del caos.'
    }
};

// Mostrar el test
router.get('/cuestionario', (req, res) => {
    res.render('cuestionario');
});

// Calcular el monstruo ganador
router.post('/cuestionario', (req, res) => {
    const puntos = { vampiro: 0, licantropo: 0, fantasma: 0, demonio: 0 };

    // Recorre todas las respuestas enviadas (p1, p2, p3...) y suma 1 punto al monstruo elegido
    for (let pregunta in req.body) {
        const voto = req.body[pregunta];
        if (puntos[voto] !== undefined) {
            puntos[voto]++;
        }
    }

    // Busca cuál monstruo sacó más puntos
    let ganador = 'vampiro';
    for (let tipo in puntos) {
        if (puntos[tipo] > puntos[ganador]) {
            ganador = tipo;
        }
    }

    // Renderiza la página enviando los datos del monstruo ganador
    res.render('cuestionario', { resultado: monstruos[ganador] });
});


module.exports = router;
