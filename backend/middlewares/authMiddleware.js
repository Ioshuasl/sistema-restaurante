import jwt from 'jsonwebtoken'

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Acesso não autorizado. Token não fornecido" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
            return res.status(403).json({ message: "Acesso proibido. Token Inválido" });
        }

        req.user = payload; // Salva o payload (id, username, admin) na requisição
        next();
    });
}

export function isAdmin(req, res, next) {
    // Se authenticateToken rodou antes, req.user já existe
    if (req.user && req.user.admin === true) {
        return next();
    }
    
    return res.status(403).json({ 
        message: 'Acesso negado. Apenas administradores podem acessar esta rota.' 
    });
}