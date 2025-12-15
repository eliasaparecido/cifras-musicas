/**
 * Converte diferentes formatos de cifras para o formato padrão [acorde]texto
 */

/**
 * Detecta se a letra está no formato de linhas separadas (acordes em cima)
 */
export function isChordOverLyrics(lyrics: string): boolean {
  const lines = lyrics.split("\n");

  // Verifica se há linhas que parecem ser apenas acordes
  for (let i = 0; i < lines.length - 1; i++) {
    const currentLine = lines[i].trim();
    const nextLine = lines[i + 1]?.trim();

    // Linha de acordes: tem acordes musicais e poucos caracteres que não sejam acordes
    const words = currentLine.split(/\s+/).filter((w) => w.length > 0);

    if (words.length > 0) {
      const chordWords = words.filter((word) =>
        /^[A-G](#|b)?(m|maj|dim|aug|sus)?(2|4|5|6|7|9|11|13)?$/.test(word)
      );

      // Se mais de 50% das palavras são acordes, provavelmente é uma linha de acordes
      if (
        chordWords.length / words.length > 0.5 &&
        nextLine &&
        nextLine.length > 0
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Converte formato de linhas separadas para formato inline
 *
 * Exemplo entrada:
 * C                        Am
 * Senhor meu Deus, quando eu maravilhado
 *
 * Saída:
 * [C]Senhor meu Deus, quando eu [Am]maravilhado
 */
export function convertChordOverLyricsToInline(lyrics: string): string {
  const lines = lyrics.split("\n");
  const result: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const currentLine = lines[i];
    const nextLine = lines[i + 1];

    // Verifica se é uma linha de acordes
    const words = currentLine
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    const chordWords = words.filter((word) =>
      /^[A-G](#|b)?(m|maj|dim|aug|sus)?(2|4|5|6|7|9|11|13)?$/.test(word)
    );

    const isChordLine =
      words.length > 0 && chordWords.length / words.length > 0.5;

    if (isChordLine && nextLine !== undefined) {
      // É uma linha de acordes seguida de letra
      const chordPositions: Array<{ pos: number; chord: string }> = [];

      // Encontra a posição de cada acorde
      let pos = 0;
      for (const word of currentLine.split(/(\s+)/)) {
        if (
          /^[A-G](#|b)?(m|maj|dim|aug|sus)?(2|4|5|6|7|9|11|13)?$/.test(
            word.trim()
          )
        ) {
          chordPositions.push({ pos, chord: word.trim() });
        }
        pos += word.length;
      }

      // Insere os acordes na letra
      let lyricLine = nextLine;
      let offset = 0;

      for (const { pos, chord } of chordPositions.sort(
        (a, b) => a.pos - b.pos
      )) {
        const insertPos = Math.min(pos + offset, lyricLine.length);
        const before = lyricLine.substring(0, insertPos);
        const after = lyricLine.substring(insertPos);
        lyricLine = before + `[${chord}]` + after;
        offset += chord.length + 2; // [chord]
      }

      result.push(lyricLine);
      i += 2; // Pula a linha de acordes e a linha de letra
    } else {
      // Linha normal (pode ser vazia, título, etc)
      result.push(currentLine);
      i++;
    }
  }

  return result.join("\n");
}

/**
 * Normaliza a entrada do usuário para o formato padrão
 * Aceita tanto formato inline quanto linhas separadas
 */
export function normalizeLyrics(lyrics: string): string {
  // Se já está no formato inline, retorna como está
  if (lyrics.includes("[") && lyrics.includes("]")) {
    return lyrics;
  }

  // Se está no formato de linhas separadas, converte
  if (isChordOverLyrics(lyrics)) {
    return convertChordOverLyricsToInline(lyrics);
  }

  // Se não tem acordes visíveis, retorna como está
  return lyrics;
}

/**
 * Converte formato inline para linhas separadas (para exibição/edição)
 *
 * Exemplo entrada:
 * [C]Senhor meu Deus, quando eu [Am]maravilhado
 *
 * Saída:
 * C                        Am
 * Senhor meu Deus, quando eu maravilhado
 */
export function convertInlineToChordOverLyrics(lyrics: string): string {
  // Converte tags HTML de parágrafo em quebras de linha
  let processedText = lyrics
    .replace(/<\/p>/gi, '\n')  // Fecha parágrafo vira quebra de linha
    .replace(/<p>/gi, '')       // Remove abertura de parágrafo
    .replace(/<br\s*\/?>/gi, '\n');  // <br> vira quebra de linha
  
  // Remove tags HTML restantes (strong, em, etc)
  processedText = processedText.replace(/<[^>]+>/g, '');
  
  // Remove &nbsp; e outras entidades HTML
  processedText = processedText
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');
  
  const lines = processedText.split("\n");
  const result: string[] = [];

  for (const line of lines) {
    // Se a linha não tem acordes, adiciona como está
    if (!line.includes("[") || !line.includes("]")) {
      result.push(line);
      continue;
    }

    // Extrair acordes e suas posições
    const chords: Array<{ pos: number; chord: string }> = [];
    let cleanLyric = "";
    let currentPos = 0;
    let i = 0;

    while (i < line.length) {
      if (line[i] === "[") {
        // Encontrou início de acorde
        const endIndex = line.indexOf("]", i);
        if (endIndex !== -1) {
          const chord = line.substring(i + 1, endIndex);
          chords.push({ pos: currentPos, chord });
          i = endIndex + 1;
        } else {
          cleanLyric += line[i];
          currentPos++;
          i++;
        }
      } else {
        cleanLyric += line[i];
        currentPos++;
        i++;
      }
    }

    // Se não tem acordes na linha, adiciona como está
    if (chords.length === 0) {
      result.push(line);
      continue;
    }

    // Criar linha de acordes
    let chordLine = "";
    let lastPos = 0;

    for (const { pos, chord } of chords) {
      // Adicionar espaços até a posição do acorde
      chordLine += " ".repeat(Math.max(0, pos - lastPos));
      chordLine += chord;
      lastPos = pos + chord.length;
    }

    // Adicionar linha de acordes e linha de letra
    result.push(chordLine);
    result.push(cleanLyric);
  }

  return result.join("\n");
}

/**
 * Remove todos os acordes da letra, deixando apenas o texto
 *
 * Exemplo entrada:
 * [C]Senhor meu Deus, quando eu [Am]maravilhado
 *
 * Saída:
 * Senhor meu Deus, quando eu maravilhado
 */
export function removeChords(lyrics: string): string {
  const lines = lyrics.split("\n");
  const result: string[] = [];

  for (const line of lines) {
    // Se a linha não tem acordes, adiciona como está
    if (!line.includes("[") || !line.includes("]")) {
      result.push(line);
      continue;
    }

    // Remove os acordes do formato [acorde]
    let cleanLine = "";
    let i = 0;

    while (i < line.length) {
      if (line[i] === "[") {
        // Encontrou início de acorde, pula até o fechamento
        const endIndex = line.indexOf("]", i);
        if (endIndex !== -1) {
          i = endIndex + 1;
        } else {
          cleanLine += line[i];
          i++;
        }
      } else {
        cleanLine += line[i];
        i++;
      }
    }

    result.push(cleanLine);
  }

  return result.join("\n");
}
