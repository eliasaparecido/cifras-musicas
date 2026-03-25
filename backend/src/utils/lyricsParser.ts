/**
 * Processa e normaliza letras de músicas com cifras
 * Sistema: texto puro com cifras identificadas automaticamente
 * Formato: linhas de acordes intercaladas com linhas de letra
 */

/**
 * Remove tags HTML e converte para texto puro
 */
function stripHtmlTags(html: string): string {
  // Converte tags de parágrafo em quebras de linha
  let text = html
    .replace(/<\/p>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n');

  // Remove todas as tags HTML
  text = text.replace(/<[^>]+>/g, '');

  // Converte entidades HTML
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');

  return text;
}

/**
 * Normaliza a entrada do usuário para texto puro
 * SEMPRE remove HTML, mesmo de dados antigos
 */
export function normalizeLyrics(lyrics: string): string {
  if (!lyrics) return '';

  // Remove HTML de dados antigos e novos
  const cleaned = stripHtmlTags(lyrics);

  // Retorna texto puro sem espaços extras nas pontas
  return cleaned.trim();
}

/**
 * Processa a letra para exibição (retorna texto puro)
 */
export function convertInlineToChordOverLyrics(lyrics: string): string {
  return normalizeLyrics(lyrics);
}

/**
 * Verifica se uma linha contém apenas acordes
 */
function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Padrão de acorde: nota (A-G) + opcional (#/b) + opcional (sufixo como m, 7, maj7, etc)
  const chordPattern = /^[A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?[0-9]*(?:\/[A-G][#b]?)?$/;

  // Divide a linha em palavras
  const words = trimmed.split(/\s+/);

  // Linha deve ter pelo menos 1 palavra
  if (words.length === 0) return false;

  // Todas as palavras da linha devem ser acordes
  const allChords = words.every(word => chordPattern.test(word));

  return allChords;
}

/**
 * Remove todos os acordes da letra, deixando apenas o texto
 */
export function removeChords(lyrics: string): string {
  const lines = lyrics.split("\n");
  const result: string[] = [];

  for (const line of lines) {
    if (!isChordLine(line)) {
      result.push(line);
    }
  }

  return result.join("\n");
}

/**
 * Exporta isChordLine para uso externo
 */
export { isChordLine };
