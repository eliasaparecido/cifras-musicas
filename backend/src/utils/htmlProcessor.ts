/**
 * Processa HTML e extrai informações de formatação para uso no PDF
 */

interface TextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

interface ProcessedLine {
  segments: TextSegment[];
  raw: string;
}

/**
 * Converte HTML em uma estrutura de linhas com segmentos formatados
 */
export function parseHtmlToFormattedLines(html: string): ProcessedLine[] {
  // Remover tags <p> e converter para quebras de linha
  let processed = html
    .replace(/<\/p>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n');

  const lines: ProcessedLine[] = [];
  const tempLines = processed.split('\n');

  for (const line of tempLines) {
    const segments = parseLineSegments(line);
    const raw = line.replace(/<[^>]+>/g, ''); // Remove todas as tags para texto puro
    lines.push({ segments, raw });
  }

  return lines;
}

/**
 * Analisa uma linha e retorna segmentos com formatação
 */
function parseLineSegments(line: string): TextSegment[] {
  const segments: TextSegment[] = [];
  
  // Regex para capturar texto com ou sem tags
  const regex = /(<\/?(?:b|strong|i|em|u)>|[^<]+)/gi;
  let matches = line.match(regex);
  
  if (!matches) {
    return [{ text: line }];
  }

  let currentBold = false;
  let currentItalic = false;
  let currentUnderline = false;
  let buffer = '';

  for (const match of matches) {
    if (match === '<b>' || match === '<strong>') {
      if (buffer) {
        segments.push({
          text: buffer,
          bold: currentBold,
          italic: currentItalic,
          underline: currentUnderline,
        });
        buffer = '';
      }
      currentBold = true;
    } else if (match === '</b>' || match === '</strong>') {
      if (buffer) {
        segments.push({
          text: buffer,
          bold: currentBold,
          italic: currentItalic,
          underline: currentUnderline,
        });
        buffer = '';
      }
      currentBold = false;
    } else if (match === '<i>' || match === '<em>') {
      if (buffer) {
        segments.push({
          text: buffer,
          bold: currentBold,
          italic: currentItalic,
          underline: currentUnderline,
        });
        buffer = '';
      }
      currentItalic = true;
    } else if (match === '</i>' || match === '</em>') {
      if (buffer) {
        segments.push({
          text: buffer,
          bold: currentBold,
          italic: currentItalic,
          underline: currentUnderline,
        });
        buffer = '';
      }
      currentItalic = false;
    } else if (match === '<u>') {
      if (buffer) {
        segments.push({
          text: buffer,
          bold: currentBold,
          italic: currentItalic,
          underline: currentUnderline,
        });
        buffer = '';
      }
      currentUnderline = true;
    } else if (match === '</u>') {
      if (buffer) {
        segments.push({
          text: buffer,
          bold: currentBold,
          italic: currentItalic,
          underline: currentUnderline,
        });
        buffer = '';
      }
      currentUnderline = false;
    } else {
      // Texto normal
      buffer += match;
    }
  }

  // Adicionar buffer final
  if (buffer) {
    segments.push({
      text: buffer,
      bold: currentBold,
      italic: currentItalic,
      underline: currentUnderline,
    });
  }

  return segments.length > 0 ? segments : [{ text: '' }];
}

/**
 * Remove todas as tags HTML, mantendo apenas o texto puro
 */
export function stripHtmlTags(html: string): string {
  return html
    .replace(/<\/p>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '');
}

