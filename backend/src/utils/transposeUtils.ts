/**
 * Sistema de transposição de acordes musicais
 * Suporta acordes maiores, menores, com sétima, etc.
 */

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Mapeamento de notas alternativas (sustenido/bemol)
const NOTE_EQUIVALENTS: Record<string, string> = {
  'C#': 'Db',
  'Db': 'C#',
  'D#': 'Eb',
  'Eb': 'D#',
  'F#': 'Gb',
  'Gb': 'F#',
  'G#': 'Ab',
  'Ab': 'G#',
  'A#': 'Bb',
  'Bb': 'A#',
};

/**
 * Normaliza uma nota para o formato com sustenido
 */
function normalizeNote(note: string): string {
  const upperNote = note.toUpperCase();
  if (NOTES.includes(upperNote)) return upperNote;
  if (NOTES_FLAT.includes(upperNote)) {
    return NOTE_EQUIVALENTS[upperNote] || upperNote;
  }
  return upperNote;
}

/**
 * Transpõe uma nota por um número de semitons
 */
function transposeNote(note: string, semitones: number): string {
  const normalized = normalizeNote(note);
  const index = NOTES.indexOf(normalized);
  
  if (index === -1) {
    console.warn(`Nota inválida: ${note}`);
    return note;
  }
  
  const newIndex = (index + semitones + 12) % 12;
  return NOTES[newIndex];
}

/**
 * Extrai a nota base de um acorde (ex: "Am7" -> "A", "C#m" -> "C#")
 */
function extractRootNote(chord: string): { root: string; suffix: string } {
  const match = chord.match(/^([A-G][#b]?)(.*)/);
  
  if (!match) {
    return { root: chord, suffix: '' };
  }
  
  return {
    root: match[1],
    suffix: match[2],
  };
}

/**
 * Transpõe um acorde completo
 */
export function transposeChord(chord: string, semitones: number): string {
  const { root, suffix } = extractRootNote(chord);
  const newRoot = transposeNote(root, semitones);
  return newRoot + suffix;
}

/**
 * Calcula a diferença em semitons entre duas notas
 */
export function getSemitonesDifference(fromKey: string, toKey: string): number {
  const fromNote = normalizeNote(fromKey.replace(/m$/, '')); // Remove 'm' de acordes menores
  const toNote = normalizeNote(toKey.replace(/m$/, ''));
  
  const fromIndex = NOTES.indexOf(fromNote);
  const toIndex = NOTES.indexOf(toNote);
  
  if (fromIndex === -1 || toIndex === -1) {
    console.warn(`Tom inválido: ${fromKey} -> ${toKey}`);
    return 0;
  }
  
  return (toIndex - fromIndex + 12) % 12;
}

/**
 * Transpõe toda a letra da música
 * Identifica acordes entre colchetes [Acorde] e transpõe
 */
export function transposeLyrics(lyrics: string, fromKey: string, toKey: string): string {
  const semitones = getSemitonesDifference(fromKey, toKey);
  
  if (semitones === 0) return lyrics;
  
  // Regex para encontrar acordes entre colchetes ou em formato padrão
  const chordRegex = /\[([A-G][#b]?[^\]]*)\]|(?:^|\s)([A-G][#b]?(?:m|maj|dim|aug|sus)?[0-9]*)(?=\s|$)/gm;
  
  return lyrics.replace(chordRegex, (match, bracketChord, spaceChord) => {
    const chord = bracketChord || spaceChord;
    const transposed = transposeChord(chord, semitones);
    
    if (bracketChord) {
      return `[${transposed}]`;
    } else {
      return match.replace(chord, transposed);
    }
  });
}

/**
 * Lista todos os tons disponíveis
 */
export function getAllKeys(): string[] {
  return [...NOTES, ...NOTES.map(n => n + 'm')];
}
