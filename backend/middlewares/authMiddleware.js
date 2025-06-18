import jwt from 'jsonwebtoken'

export function isAdmin(req, res, next){
    if (req.user && req.user.cargo === 'administrador') {
        return next(); // Chama o próximo middleware ou rota
    } else {
        res.status(403).json({ message: "Acesso proibido. Requer permissão de administrador." });
    }
}

export function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization']

    const token = authHeader && authHeader.split(' ')[1]

    if (token == null){
        return res.status(401).json({
            message:"Acesso não autorizado. Token não fornecido"
        })
    }

    jwt.verify(token,process.env.JWT_SECRET, (err, userPlayload) => {
        if (err) {
            return res.status(403).json({
                message: "Acesso proibido. Token Inválido"
            })
        }

        req.user = userPlayload
        next()
    })
}