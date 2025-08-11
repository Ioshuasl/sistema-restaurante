import jwt from 'jsonwebtoken'

export function isAdmin(req, res, next) {
    // 1. Obter o token do header da requisição
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).send({ message: 'Token não fornecido.' });
    }

    // 2. Verificar e decodificar o token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Token inválido.' });
        }

        console.log(decoded)

        // Extrair as informações do usuário e verificar o cargo
        if (decoded.admin === true) {
            // O usuário é um administrador, continue para a próxima função
            next();
        } else {
            // O usuário não é um administrador, negar acesso
            return res.status(403).send({ message: 'Acesso negado. Apenas administradores podem acessar esta rota.' });
        }
    });
}

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']

    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) {
        return res.status(401).json({
            message: "Acesso não autorizado. Token não fornecido"
        })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userPlayload) => {
        if (err) {
            return res.status(403).json({
                message: "Acesso proibido. Token Inválido"
            })
        }

        req.user = userPlayload
        next()
    })
}