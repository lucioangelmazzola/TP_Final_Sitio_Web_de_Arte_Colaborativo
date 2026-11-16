const express = require('express');
const { formidable } = require('formidable');
const bcrypt = require('bcrypt'); // Verificá si en routes/index.js usás 'bcrypt', 'bcryptjs' o 'crypto'
const db = require('../database/db.js');

const router = express.Router();

const avataresUsuarios = {};

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


/**
 * Página principal de usuario/a.
 */

router.get('/', (req, res, next) => {
    const username = req.session.user;
    const userImages = db.getAllUserImages(username);
    const imgPaths = userImages.map(entry => '/uploads/' + entry.filehash);

    res.render('user', { 
        pageTitle: 'Usuario', 
        images: imgPaths,
        avatar: avataresUsuarios[username] || '/public/img/avatar-default.png'
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
        avatar: avataresUsuarios[username] || '/public/img/avatar-default.png'
    });
});


/**
 * Página de configuración de usuario/a.
 */

router.get('/settings', (req, res, next) => {
    const username = req.session.user;
    res.render('settings', { 
        pageTitle: 'Configuración',
        avatar: avataresUsuarios[username] || '/public/img/avatar-default.png'
    });
});

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

        // 1. Si subió una foto nueva, la guardamos
        if (files.avatarFile && files.avatarFile.length > 0 && files.avatarFile[0].size > 0) {
            const archivo = files.avatarFile[0];
            avataresUsuarios[username] = '/uploads/' + archivo.newFilename;
        }

        // 2. Leemos el nuevo nombre y la nueva contraseña (si escribió algo)
        const newUsername = fields.newUsername ? fields.newUsername[0].trim() : '';
        const newPassword = fields.newPassword ? fields.newPassword[0].trim() : '';

        if (newUsername && newUsername !== username && db.userExists(newUsername)) {
            return res.send('<script>alert("Ese nombre de usuario ya existe."); window.location.href="/user/settings";</script>');
        }

        if (newUsername || newPassword) {
            let newHash = null;
            if (newPassword) {
                newHash = bcrypt.hashSync(newPassword, 10);
            }

            db.updateUser(username, newUsername, newHash);

            // Si cambió su nombre, actualizamos también la sesión y movemos su avatar al nuevo nombre
            if (newUsername && newUsername !== username) {
                if (avataresUsuarios[username]) {
                    avataresUsuarios[newUsername] = avataresUsuarios[username];
                    delete avataresUsuarios[username];
                }
                req.session.user = newUsername;
            }
        }

        res.redirect('/user');
    });
});


/**
 * Endpoint para subir archivos.
 */

router.get('/upload', (req, res, next) => {
    const username = req.session.user;
    const userImages = db.getAllUserImages(username);
    const imgPaths = userImages.map(entry => '/uploads/' + entry.filehash);  // /uploads/zab3j5kdstvmz...
    res.render('upload', { pageTitle: 'Página para subir archivos', images: imgPaths });
});


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