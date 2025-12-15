import { Router, Request, Response } from "express";
import prisma from "../db/prisma.js";
import { transposeLyrics } from "../utils/transposeUtils.js";
import {
  convertInlineToChordOverLyrics,
  removeChords,
  normalizeLyrics,
} from "../utils/lyricsParser.js";
import { parseHtmlToFormattedLines } from "../utils/htmlProcessor.js";
import { jsPDF } from "jspdf";

const router = Router();

/**
 * Renderiza texto formatado (com suporte a negrito, itálico, sublinhado)
 */
function renderFormattedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options: { bold?: boolean; italic?: boolean; underline?: boolean; maxWidth?: number }
): number {
  const { bold, italic, underline, maxWidth } = options;

  // Configurar estilo da fonte
  let fontStyle = "normal";
  if (bold && italic) {
    fontStyle = "bolditalic";
  } else if (bold) {
    fontStyle = "bold";
  } else if (italic) {
    fontStyle = "italic";
  }

  doc.setFont("courier", fontStyle);

  // Renderizar texto
  doc.text(text, x, y, { maxWidth });

  // Adicionar sublinhado se necessário
  if (underline) {
    const textWidth = doc.getTextWidth(text);
    doc.line(x, y + 0.5, x + textWidth, y + 0.5);
  }

  return doc.getTextWidth(text);
}

interface TextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

/**
 * Renderiza uma linha com segmentos formatados
 */
function renderFormattedLine(
  doc: jsPDF,
  segments: TextSegment[],
  x: number,
  y: number,
  maxWidth: number
): void {
  let currentX = x;

  for (const segment of segments) {
    const width = renderFormattedText(doc, segment.text, currentX, y, {
      bold: segment.bold,
      italic: segment.italic,
      underline: segment.underline,
      maxWidth: maxWidth - (currentX - x),
    });
    currentX += width;
  }
}

/**
 * Calcula a altura necessária para uma música (em unidades do PDF)
 */
function calculateSongHeight(
  linesCount: number,
  lineHeight: number,
  includeHeader: boolean = true
): number {
  const headerHeight = includeHeader ? 20 : 0; // título + artista + tom + espaçamento
  const lyricsHeight = linesCount * lineHeight;
  const spacingAfter = 10; // espaçamento após a música
  return headerHeight + lyricsHeight + spacingAfter;
}

// POST /api/pdf/generate - Gerar PDF de uma playlist
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { playlistId, showChords = true } = req.body;

    if (!playlistId) {
      return res.status(400).json({ error: "ID da playlist é obrigatório" });
    }

    // Buscar playlist com as músicas
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        songs: {
          include: {
            song: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist não encontrada" });
    }

    // Criar PDF
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    const lineHeight = showChords ? 5 : 5.5;

    if (showChords) {
      // MODO COM CIFRAS: quebra inteligente por necessidade de espaço
      let yPosition = 20;
      let isFirstSong = true;

      for (let i = 0; i < playlist.songs.length; i++) {
        const playlistSong = playlist.songs[i];
        const { song, key } = playlistSong;

        // Normaliza para formato inline se estiver em formato "chord-over-lyrics"
        let lyrics = normalizeLyrics(song.lyrics);

        // Transpor letra se necessário
        if (key !== song.originalKey) {
          lyrics = transposeLyrics(lyrics, song.originalKey, key);
        }

        // Converter para formato separado (cifras sobre letras)
        lyrics = convertInlineToChordOverLyrics(lyrics);

        // Processar HTML para obter linhas formatadas
        const processedLines = parseHtmlToFormattedLines(lyrics);
        const linesCount = processedLines.length;

        // Calcular altura necessária
        const songHeight = calculateSongHeight(linesCount, lineHeight, true);

        // Verificar se precisa quebrar página
        // Se não couber na página atual E não for a primeira música, quebrar
        if (!isFirstSong && yPosition + songHeight > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }

        // Adicionar espaçamento entre músicas (exceto a primeira)
        if (!isFirstSong) {
          yPosition += 15;
        }

        // Título e artista
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(song.title, margin, yPosition);
        yPosition += 7;

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(song.artist, margin, yPosition);
        yPosition += 6;

        // Tom
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text(`Tom: ${key}`, margin, yPosition);
        yPosition += 8;

        // Preparar linhas da letra
        doc.setFontSize(10);

        // Verificar se precisa de duas colunas
        const estimatedHeight = linesCount * lineHeight + yPosition;
        
        if (estimatedHeight > pageHeight - 20) {
          // Dividir em duas colunas
          const columnWidth = (contentWidth - 10) / 2;
          const midPoint = Math.ceil(processedLines.length / 2);
          const leftLines = processedLines.slice(0, midPoint);
          const rightLines = processedLines.slice(midPoint);

          // Coluna esquerda
          let leftY = yPosition;
          for (const line of leftLines) {
            if (leftY > pageHeight - 20) break;
            
            if (line.segments.length === 0 || !line.raw) {
              leftY += lineHeight;
              continue;
            }
            
            renderFormattedLine(doc, line.segments, margin, leftY, columnWidth);
            leftY += lineHeight;
          }

          // Coluna direita
          let rightY = yPosition;
          const rightX = margin + columnWidth + 10;
          for (const line of rightLines) {
            if (rightY > pageHeight - 20) break;
            
            if (line.segments.length === 0 || !line.raw) {
              rightY += lineHeight;
              continue;
            }
            
            renderFormattedLine(doc, line.segments, rightX, rightY, columnWidth);
            rightY += lineHeight;
          }

          // Atualizar yPosition para depois da maior coluna
          yPosition = Math.max(leftY, rightY);
        } else {
          // Uma coluna normal
          for (const line of processedLines) {
            if (yPosition > pageHeight - 20) {
              doc.addPage();
              yPosition = 20;
            }

            if (line.segments.length === 0 || !line.raw) {
              yPosition += lineHeight;
              continue;
            }

            renderFormattedLine(doc, line.segments, margin, yPosition, contentWidth);
            yPosition += lineHeight;
          }
        }

        isFirstSong = false;
      }
    } else {
      // MODO SEM CIFRAS: quebra inteligente - múltiplas músicas por página quando possível
      let yPosition = 20;
      let isFirstSong = true;

      for (let i = 0; i < playlist.songs.length; i++) {
        const playlistSong = playlist.songs[i];
        const { song, key } = playlistSong;

        // Normaliza para formato inline se estiver em formato "chord-over-lyrics"
        let lyrics = normalizeLyrics(song.lyrics);

        // Transpor letra se necessário
        if (key !== song.originalKey) {
          lyrics = transposeLyrics(lyrics, song.originalKey, key);
        }

        // Remover cifras
        lyrics = removeChords(lyrics);

        // Processar HTML para obter linhas formatadas
        const processedLines = parseHtmlToFormattedLines(lyrics);
        
        // Filtrar linhas vazias
        const nonEmptyLines = processedLines.filter(line => line.raw.trim() !== '');
        const linesCount = nonEmptyLines.length;

        // Calcular altura necessária para esta música
        const songHeight = calculateSongHeight(linesCount, lineHeight, true);

        // Verificar se cabe na página atual
        if (!isFirstSong && yPosition + songHeight > pageHeight - 20) {
          // Não cabe, adicionar nova página
          doc.addPage();
          yPosition = 20;
        }

        // Adicionar espaçamento entre músicas (exceto a primeira)
        if (!isFirstSong) {
          yPosition += 15;
        }

        // Título e artista
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(song.title, margin, yPosition);
        yPosition += 6;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(song.artist, margin, yPosition);
        yPosition += 5;

        // Tom (menor sem cifras)
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text(`Tom: ${key}`, margin, yPosition);
        yPosition += 7;

        // Preparar linhas da letra
        doc.setFontSize(10);

        for (const line of nonEmptyLines) {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }

          renderFormattedLine(doc, line.segments, margin, yPosition, contentWidth);
          yPosition += lineHeight;
        }

        isFirstSong = false;
      }
    }

    // Gerar PDF como buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Enviar PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${playlist.name}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Erro ao gerar PDF" });
  }
});

export default router;
