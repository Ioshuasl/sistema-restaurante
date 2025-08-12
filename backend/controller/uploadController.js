import path from 'path';
import { fileURLToPath } from 'url';

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
      
      // A URL é o caminho público para o arquivo
      // Exemplo: http://api.restaurante/uploads/nome-do-arquivo.jpg
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;

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