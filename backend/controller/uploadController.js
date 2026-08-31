import path from 'path';
import { fileURLToPath } from 'url';
import { buildUploadUrl } from '../utils/publicUrl.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UploadController {
  async uploadImage(req, res) {
    if (!req.file) {
      return res.status(400).send({ message: 'Nenhum arquivo enviado.' });
    }

    try {
      // O nome do arquivo salvo é gerado pelo Multer
      const fileName = req.file.filename;
      const imageUrl = buildUploadUrl(fileName);

      return res.status(200).send({
        message: 'Imagem enviada com sucesso.',
        imageUrl: imageUrl,
      });

    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Erro ao processar o upload.' });
    }
  }
}

export default new UploadController();