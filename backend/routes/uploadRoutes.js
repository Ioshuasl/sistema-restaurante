import express from 'express';
import multer from 'multer';
import uploadController from '../controller/uploadController.js';

const uploadRoutes = express.Router();

// Configuração do armazenamento do Multer
const storage = multer.diskStorage({
  // Define o diretório de destino para os uploads
  destination: function(req, file, cb) {
    // Você deve criar a pasta 'uploads' na raiz do seu projeto
    cb(null, 'public/uploads/');
  },
  // Define o nome do arquivo, garantindo que seja único
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Rota para fazer o upload de uma única imagem
uploadRoutes.post('/upload/image', upload.single('image'), uploadController.uploadImage);

export default uploadRoutes;