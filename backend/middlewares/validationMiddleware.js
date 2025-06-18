import express from 'express'
import session from 'express-session'

const validator = express()

validator.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Defina como true se estiver usando HTTPS
}));

// Este middleware recebe um schema e retorna a função de validação
export const validate = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body, {
            abortEarly: false, // Retorna todos os erros de uma vez
            stripUnknown: true // Remove campos que não estão no schema
        });
        
        return next();
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            const formattedError = {
                status: "error",
                statusCode: 400,
                message: "Erro de validação.",
                details: error.errors
            };
            return res.status(400).json(formattedError);
        }
        return next(error);
    }
};