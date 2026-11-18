const express = require('express');
const { formidable } = require('formidable');
const bcrypt = require('bcrypt'); // Verificá si en routes/index.js usás 'bcrypt', 'bcryptjs' o 'crypto'
const db = require('../database/db.js');

const router = express.Router();

/**
 * En app.js se insertan estas rutas en '/users'
 * con la expresión:
 *
 * app.use("/users", userRouter);
 *
 * Las rutas desde este archivo son relativas a
 * '/user', por lo tanto, '/' en este archivo
 * es '/user' en el servidor y '/profile' en este
 * archivo es '/user/profile' en el servidor.
 */

/**
 * Middleware de enrutador
 *
 * Middleware para restringir el acceso a las páginas
 * cuando el usuario no está logueado. Se aplica en cadena
 * en las rutas que lo requieran dentro la sección /user.
 */

function restricted(req, res, next) {
    if (req.session.user) {
        // Le pasa el control al próximo middleware que muestra la página de usuario.
        next();
    } else {
        // Guarda un mensaje de error en la sesión y redirecciona a la ruta /login que es pública.
        // Puede ser otra ruta como _home_ u otra página de error.
        // No llama a next() por lo que genera una respuesta y corta la cadena de middlewares.
        req.session.error = 'Acceso denegado!';
        res.redirect('/login');
    }
}

router.use(restricted);

// Diccionario de todos los monstruos, descripciones e imagenes
const monstruos = {
    ciervo: {
        titulo: 'EL CIERVO',
        imagen: '/public/img/CiervoM.png',
        descripcion: 'Es una criatura que acecha silenciosamente en los bosques, camuflándose entre los árboles para seguir a sus víctimas sin ser detectada. Astuta, paciente y extremadamente veloz, espera el momento perfecto para atacar, persiguiendo a su presa hasta que ya no tenga escapatoria.'
    },
    arana: {
        titulo: 'EL ARACNIDO',
        imagen: '/public/img/AranaM.png',
        descripcion: 'Es una criatura corpulenta hecha de tela vieja y desgastada que deambula sin rumbo aparente. Curiosa y ruidosa, se acerca a cualquier cosa que llame su atención, sin distinguir entre amigos y enemigos. Aunque su comportamiento parece neutral, su enorme cuerpo y sus movimientos bruscos la convierten en una presencia amenazadora para cualquiera que se cruce en su camino.'
    },
    espectro: {
        titulo: 'EL ESPECTRO',
        imagen: '/public/img/FantasmaM.png',
        descripcion: 'Es una criatura extremadamente inteligente y cautelosa que acecha a sus víctimas desde las sombras. De cuerpo delgado y alargado, utiliza su astucia para manipular la mente de quienes persigue, provocando miedo y confusión hasta conducirlos a trampas cuidadosamente planeadas. Aunque es asustadiza y evita el enfrentamiento directo, puede acorralar a sus presas mediante estrategias y juegos psicológicos, convirtiendo la cacería en una tortura mental.'
    },
    oso: {
        titulo: 'EL OSITO',
        imagen: '/public/img/OsoM.png',
        descripcion: 'Es una entidad demoníaca que acecha silenciosamente a sus víctimas, utilizando su inteligencia para imitar voces, sonidos e incluso comportamientos familiares. Disfruta jugando con la mente de quienes persigue, engañándolos y atrayéndolos hacia situaciones cada vez más aterradoras. Astuta y manipuladora, rara vez ataca directamente: prefiere quebrar psicológicamente a sus presas antes de acabar con ellas.'
    }
};

// Muestra el test
router.get('/cuestionario', (req, res) => {
    res.render('cuestionario');
});

// Calcula el monstruo ganador
router.post('/cuestionario', (req, res) => {
    const puntos = { ciervo: 0, arana: 0, espectro: 0, oso: 0 };

    // Recorre todas las respuestas enviadas y suma 1 punto al monstruo elegido
    for (let pregunta in req.body) {
        const voto = req.body[pregunta];
        if (puntos[voto] !== undefined) {
            puntos[voto]++;
        }
    }

    // Busca cuál monstruo sacó más puntos
    let ganador = 'espectro';
    for (let tipo in puntos) {
        if (puntos[tipo] > puntos[ganador]) {
            ganador = tipo;
        }
    }

    // Renderiza la página enviando los datos del monstruo ganador
    res.render('cuestionario', { resultado: monstruos[ganador] });
});

/**
 * Página principal de usuario/a.
 */

router.get('/', (req, res, next) => {
    // Obtiene la informacion del usuario
    const username = req.session.user;
    const userImages = db.getAllUserImages(username);
    const imgPaths = userImages.map(entry => '/uploads/' + entry.filehash);

    res.render('user', { 
        pageTitle: 'Usuario', 
        images: imgPaths,
        avatar: db.getUserAvatar(username) || '/public/img/avatar-default.gif'
    });
});


/**
 * Página de perfil de usuario/a.
 */

router.get('/profile', (req, res, next) => {
    const username = req.session.user;
    const userImages = db.getAllUserImages(username);
    const imgPaths = userImages.map(entry => '/uploads/' + entry.filehash);

    res.render('profile', { 
        pageTitle: 'Perfil', 
        images: imgPaths,
        avatar: db.getUserAvatar(username) || '/public/img/avatar-default.gif'
    });
});


/**
 * Página de configuración de usuario/a.
 */

// Muestra el formulario de configuracion
router.get('/settings', (req, res, next) => {
    const username = req.session.user;
    res.render('settings', { 
        pageTitle: 'Configuración',
        avatar: db.getUserAvatar(username) || '/public/img/avatar-default.gif'
    });
});

// Procesa los cambios en la cuenta del usuario
router.post('/settings', (req, res, next) => {
    const form = formidable({
        uploadDir: 'uploads',
        filter: ({ mimetype }) => {
            const supportedTypes = new Set(['image/jpeg', 'image/png', 'image/gif']);
            return mimetype && supportedTypes.has(mimetype);
        }
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }

        let username = req.session.user;

        // Se guarda la nueva foto
        if (files.avatarFile && files.avatarFile.length > 0 && files.avatarFile[0].size > 0) {
            const archivo = files.avatarFile[0];
            db.setUserAvatar(username, '/uploads/' + archivo.newFilename);
        }

        // Lee el nuevo nombre y la nueva contraseña
        const newUsername = fields.newUsername ? fields.newUsername[0].trim() : '';
        const newPassword = fields.newPassword ? fields.newPassword[0].trim() : '';

        // Verifica que el nombre no se haya usado
        if (newUsername && newUsername !== username && db.userExists(newUsername)) {
            return res.render('settings', {
                pageTitle: 'Configuración',
                avatar: db.getUserAvatar(username) || '/public/img/avatar-default.gif',
                error: 'Ese nombre de usuario ya existe. Elegí otro.'
            });
        }

        // Encripta los nuevos datos
        if (newUsername || newPassword) {
            let newHash = null;
            if (newPassword) {
                newHash = bcrypt.hashSync(newPassword, 10);
            }

            db.updateUser(username, newUsername, newHash);

            // Actualiza la sesión y mueve su avatar al nuevo nombre
            if (newUsername && newUsername !== username) {
                req.session.user = newUsername;
            }
        }

        res.redirect('/user');
    });
});


/**
 * Endpoint para subir archivos.
 */

// Muestra el formulario de subida junto con las imágenes ya cargadas del usuario.
router.get('/upload', (req, res, next) => {
    const username = req.session.user;
    const userImages = db.getAllUserImages(username);
    const imgPaths = userImages.map(entry => '/uploads/' + entry.filehash);  // /uploads/zab3j5kdstvmz...
    res.render('upload', { pageTitle: 'Página para subir archivos', images: imgPaths });
});

// Guarda las imágenes subidas en el servidor y en la base de datos.
router.post('/upload', (req, res, next) => {
    const form = formidable({
        uploadDir: 'uploads',
        filter: ({ mimetype }) => {
            const supportedTypes = new Set(['image/jpeg', 'image/png']);
            return mimetype && supportedTypes.has(mimetype);
        }
    });

    form.parse(req, (err, fields, files) => {
        if(err) {
            next(err);
            return
        }

        const username = req.session.user;

        // Registra cada imagen subida en la tabla user_images.
        for(let img of files.userFiles) {
            db.addUserImage(username, img.newFilename, img.originalFilename, fields.descImg[0]);
        }

        db.log();

        res.redirect('/user/upload');
    });
});


/**
 * Logout
 */

router.get('/logout', (req, res, next) => {
    // Destruye los datos de la sesión que se regeneran para la próxima petición.
    // El usuario queda deslogueado y se lo redirecciona a la página principal.
    req.session.destroy(() => {
        res.redirect('/');
    });
});


module.exports = router;