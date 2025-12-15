import { Router } from 'express';
import multer from 'multer';
import { createWorker } from 'tesseract.js';

const router = Router();

// Configurar multer para armazenar arquivo em memória
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// POST /api/ocr/extract - Extrair texto de imagem
router.post('/extract', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem fornecida' });
    }

    console.log('Processando imagem com OCR...');
    
    // Criar worker do Tesseract com configurações otimizadas
    const worker = await createWorker('por', 1, {
      logger: (m) => console.log(m),
    });
    
    // Configurar para melhor reconhecimento de layout
    await worker.setParameters({
      tessedit_pageseg_mode: '6' as any, // Assume bloco uniforme de texto
      preserve_interword_spaces: '1',
    });

    // Processar imagem e obter hOCR para melhor controle de espaçamento
    const { data } = await worker.recognize(req.file.buffer);
    
    await worker.terminate();

    // Processar o texto preservando espaçamento
    let processedText = data.text;
    
    // Normalizar espaços mas preservar estrutura
    processedText = processedText
      .split('\n')
      .map(line => {
        // Não alterar linhas vazias
        if (!line.trim()) return '';
        // Preservar espaçamento interno, remover apenas do final
        return line.trimEnd();
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n'); // Limitar linhas vazias consecutivas

    console.log('OCR concluído. Confiança:', data.confidence.toFixed(2) + '%');

    res.json({
      text: processedText,
      confidence: data.confidence,
    });
  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    res.status(500).json({ 
      error: 'Erro ao processar imagem',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

export default router;
