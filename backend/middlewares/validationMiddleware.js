// Este middleware recebe um schema e retorna a função de validação
import * as yup from 'yup'

export const validate = (schema) => async (req, res, next) => {
    try {
        const validated = await schema.validate(req.body, {
            abortEarly: false, // Retorna todos os erros de uma vez
            stripUnknown: true // Remove campos que não estão no schema
        });
        req.body = validated;
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
