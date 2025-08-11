// Este middleware recebe um schema e retorna a função de validação
import * as yup from 'yup'
import * as bcrypt from 'bcrypt'

export const validate = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body, {
            abortEarly: false, // Retorna todos os erros de uma vez
            stripUnknown: true // Remove campos que não estão no schema
        });
        console.log("Validação finalizada com sucesso")
        return next();
    } catch (error) {
        console.error(error)
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