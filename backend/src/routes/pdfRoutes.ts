import { Router, Request, Response } from 'express';
import prisma from '../db/prisma.js';
import { transposeLyrics } from '../utils/transposeUtils.js';
import { convertInlineToChordOverLyrics } from '../utils/lyricsParser.js';
import pkg from 'jspdf';
const { jsPDF } = pkg;

const router = Router();

interface SongForPdf {
  title: string;
  artist: string;
  key: string;
  lyrics: string;
}

// POST /api/pdf/generate - Gerar PDF de uma playlist
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { playlistId } = req.body;
    
    if (!playlistId) {
      return res.status(400).json({ error: 'ID da playlist é obrigatório' });
    }
    
    // Buscar playlist com as músicas
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        songs: {
          include: {
            song: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist não encontrada' });
    }
    
    // Criar PDF
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    const lineHeight = 5;
    
    // Processar cada música
    for (let i = 0; i < playlist.songs.length; i++) {
      const playlistSong = playlist.songs[i];
      const { song, key } = playlistSong;
      
      // Adicionar nova página para cada música (exceto a primeira)
      if (i > 0) {
        doc.addPage();
      }
      
      let yPosition = 20;
      
      // Transpor letra se necessário
      let lyrics = key !== song.originalKey
        ? transposeLyrics(song.lyrics, song.originalKey, key)
        : song.lyrics;
      
      // Converter para formato separado (cifras sobre letras)
      lyrics = convertInlineToChordOverLyrics(lyrics);
      
      // Título e artista
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(song.title, margin, yPosition);
      yPosition += 7;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(song.artist, margin, yPosition);
      yPosition += 6;
      
      // Tom
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(`Tom: ${key}`, margin, yPosition);
      yPosition += 8;
      
      // Preparar linhas da letra
      doc.setFontSize(10);
      doc.setFont('courier', 'normal');
      
      const lines = lyrics.split('\n');
      const estimatedHeight = lines.length * lineHeight + yPosition;
      
      // Verificar se precisa de duas colunas
      if (estimatedHeight > pageHeight - 20) {
        // Dividir em duas colunas
        const columnWidth = (contentWidth - 10) / 2;
        const midPoint = Math.ceil(lines.length / 2);
        const leftLines = lines.slice(0, midPoint);
        const rightLines = lines.slice(midPoint);
        
        // Coluna esquerda
        let leftY = yPosition;
        for (const line of leftLines) {
          if (leftY > pageHeight - 20) break;
          doc.text(line || ' ', margin, leftY, { maxWidth: columnWidth });
          leftY += lineHeight;
        }
        
        // Coluna direita
        let rightY = yPosition;
        const rightX = margin + columnWidth + 10;
        for (const line of rightLines) {
          if (rightY > pageHeight - 20) break;
          doc.text(line || ' ', rightX, rightY, { maxWidth: columnWidth });
          rightY += lineHeight;
        }
      } else {
        // Uma coluna normal
        for (const line of lines) {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.text(line || ' ', margin, yPosition, { maxWidth: contentWidth });
          yPosition += lineHeight;
        }
      }
    }
    
    // Gerar PDF como buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    // Enviar PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${playlist.name}.pdf"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
});

export default router;
