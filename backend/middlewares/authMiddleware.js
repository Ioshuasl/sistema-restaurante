import express from 'express'
import session from 'express-session'

const validator = express()

validator.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Defina como true se estiver usando HTTPS
}));

export function userLogged(req, res, next) {
    if (req.session.user) {
        console.log(req.session.user);
        return next(); // Chama o próximo middleware ou rota
    } else {
        return res.status(401).send("Você precisa estar logado");
    }
}

export function isAdmin(req, res, next){
    if (req.session.user.isAdmin === true) {
        return next(); // Chama o próximo middleware ou rota
    } else {
        return res.status(403).send("Você não tem permissão para usar essa função");
    }
}