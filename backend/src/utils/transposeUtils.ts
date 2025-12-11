/**
 * Sistema robusto de transposição de acordes musicais
 * Suporta acordes maiores, menores, com sétima, diminutos, aumentados, suspensos, etc.
 * Suporta notação com sustenidos (#) e bemóis (b)
 * Suporta acordes com baixo invertido (ex: C/G, Am/E)
 */

// Escala cromática com sustenidos (formato interno - tudo maiúsculo)
const NOTES_SHARP = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

// Escala cromática com bemóis (formato interno - tudo maiúsculo)
const NOTES_FLAT = [
  "C",
  "DB",
  "D",
  "EB",
  "E",
  "F",
  "GB",
  "G",
  "AB",
  "A",
  "BB",
  "B",
];

// Mapeamento completo de equivalentes enarmônicos (sustenido ↔ bemol)
const ENHARMONIC_EQUIVALENTS: Record<string, string> = {
  "C#": "DB",
  DB: "C#",
  "D#": "EB",
  EB: "D#",
  "E#": "F",
  FB: "E",
  "F#": "GB",
  GB: "F#",
  "G#": "AB",
  AB: "G#",
  "A#": "BB",
  BB: "A#",
  "B#": "C",
  CB: "B",
};

/**
 * Converte formato externo (Eb, Bb) para interno (EB, BB)
 */
function toInternalFormat(note: string): string {
  return note.toUpperCase();
}

/**
 * Converte formato interno (EB, BB) para externo (Eb, Bb)
 * Converte 'B' maiúsculo para 'b' minúsculo APENAS quando é bemol (2 caracteres)
 */
function toExternalFormat(note: string): string {
  if (note.length === 2 && note[1] === "B") {
    return note[0] + "b";
  }
  return note;
}

/**
 * Normaliza uma nota para o formato com sustenido
 * Converte bemóis para seus equivalentes enarmônicos em sustenido
 */
function normalizeNote(note: string): string {
  const internal = toInternalFormat(note);

  // Se já está na escala de sustenidos, retorna
  if (NOTES_SHARP.includes(internal)) {
    return internal;
  }

  // Se está na escala de bemóis, converte para sustenido equivalente
  if (NOTES_FLAT.includes(internal)) {
    return ENHARMONIC_EQUIVALENTS[internal] || internal;
  }

  // Trata casos especiais (E#, Fb, B#, Cb)
  if (ENHARMONIC_EQUIVALENTS[internal]) {
    const equivalent = ENHARMONIC_EQUIVALENTS[internal];
    // Recursivamente normaliza para garantir que está na escala de sustenidos
    return normalizeNote(equivalent);
  }

  return internal;
}

/**
 * Transpõe uma nota por um número de semitons
 * @param note - A nota a ser transposta (ex: "C", "D#", "Eb")
 * @param semitones - Número de semitons para transpor (positivo = subir, negativo = descer)
 * @param preferFlat - Se true, retorna em bemol quando possível; se false, retorna em sustenido
 */
function transposeNote(
  note: string,
  semitones: number,
  preferFlat: boolean = false
): string {
  // Normaliza a nota para sustenido
  const normalized = normalizeNote(note);
  const index = NOTES_SHARP.indexOf(normalized);

  if (index === -1) {
    console.warn(`Nota inválida para transposição: ${note}`);
    return note;
  }

  // Calcula o novo índice (garante que seja positivo)
  const newIndex = (((index + semitones) % 12) + 12) % 12;

  // Retorna na notação preferida (sustenido ou bemol)
  const result = preferFlat ? NOTES_FLAT[newIndex] : NOTES_SHARP[newIndex];
  return toExternalFormat(result);
}

/**
 * Extrai a nota base de um acorde
 * Suporta acordes complexos e baixos invertidos
 * Ex: "Am7" -> { root: "A", suffix: "m7", bass: null }
 * Ex: "C/G" -> { root: "C", suffix: "", bass: "G" }
 * Ex: "Ebm7/Bb" -> { root: "Eb", suffix: "m7", bass: "Bb" }
 */
function parseChord(chord: string): {
  root: string;
  suffix: string;
  bass: string | null;
} {
  // Regex para capturar: nota base (com # ou b) + sufixo + baixo opcional (após /)
  const match = chord.match(/^([A-G][#b]?)([^\/]*)(?:\/([A-G][#b]?))?$/i);

  if (!match) {
    return { root: chord, suffix: "", bass: null };
  }

  return {
    root: match[1],
    suffix: match[2] || "",
    bass: match[3] || null,
  };
}

/**
 * Transpõe um acorde completo
 * @param chord - O acorde a ser transposto (ex: "Am7", "C/G", "Ebm")
 * @param semitones - Número de semitons para transpor
 * @param preferFlat - Se true, prefere bemóis; se false, prefere sustenidos
 */
export function transposeChord(
  chord: string,
  semitones: number,
  preferFlat: boolean = false
): string {
  const { root, suffix, bass } = parseChord(chord);

  // Transpõe a nota raiz
  const newRoot = transposeNote(root, semitones, preferFlat);

  // Transpõe o baixo se existir
  const newBass = bass ? transposeNote(bass, semitones, preferFlat) : null;

  // Reconstrói o acorde
  let result = newRoot + suffix;
  if (newBass) {
    result += "/" + newBass;
  }

  return result;
}

/**
 * Calcula a diferença em semitons entre duas tonalidades
 * @param fromKey - Tonalidade de origem (ex: "C", "Am", "Eb")
 * @param toKey - Tonalidade de destino (ex: "G", "Em", "F")
 */
export function getSemitonesDifference(fromKey: string, toKey: string): number {
  // Remove sufixo de acorde menor ('m') se presente
  const fromNote = normalizeNote(fromKey.replace(/m$/i, ""));
  const toNote = normalizeNote(toKey.replace(/m$/i, ""));

  const fromIndex = NOTES_SHARP.indexOf(fromNote);
  const toIndex = NOTES_SHARP.indexOf(toNote);

  if (fromIndex === -1 || toIndex === -1) {
    console.warn(
      `Tom inválido para cálculo de diferença: ${fromKey} -> ${toKey}`
    );
    return 0;
  }

  // Calcula a diferença (sempre positiva, no sentido horário da circunferência)
  return (toIndex - fromIndex + 12) % 12;
}

/**
 * Determina se devemos preferir bemóis ou sustenidos na transposição
 * Baseado na tonalidade de destino
 */
function shouldPreferFlats(toKey: string): boolean {
  const flatKeys = [
    "F",
    "BB",
    "EB",
    "AB",
    "DB",
    "GB",
    "CB",
    "DM",
    "GM",
    "CM",
    "FM",
    "BBM",
    "EBM",
    "ABM",
  ];
  return flatKeys.some((key) => toInternalFormat(toKey).startsWith(key));
}

/**
 * Transpõe toda a letra da música
 * Identifica acordes entre colchetes [Acorde] e transpõe
 * @param lyrics - A letra com acordes no formato [C]Letra [Am]mais letra
 * @param fromKey - Tonalidade original (ex: "C", "Am")
 * @param toKey - Tonalidade de destino (ex: "G", "Em")
 */
export function transposeLyrics(
  lyrics: string,
  fromKey: string,
  toKey: string
): string {
  const semitones = getSemitonesDifference(fromKey, toKey);

  if (semitones === 0) {
    return lyrics;
  }

  // Determina se deve usar bemóis ou sustenidos
  const preferFlat = shouldPreferFlats(toKey);

  // Regex para encontrar acordes entre colchetes [...]
  // Suporta acordes complexos: [C], [Am7], [C/G], [Ebm7/Bb], etc.
  const chordRegex = /\[([A-G][#b]?(?:[^[\]]*)?)\]/gi;

  return lyrics.replace(chordRegex, (_match, chord) => {
    const transposed = transposeChord(chord, semitones, preferFlat);
    return `[${transposed}]`;
  });
}

/**
 * Lista todos os tons disponíveis (maiores e menores)
 * Retorna em sustenidos e bemóis
 */
export function getAllKeys(): string[] {
  const sharpKeys = NOTES_SHARP.map(toExternalFormat);
  const flatKeys = NOTES_FLAT.map(toExternalFormat).filter(
    (note) => !sharpKeys.includes(note)
  );
  const majorKeys = [...new Set([...sharpKeys, ...flatKeys])];
  const minorKeys = majorKeys.map((k) => k + "m");
  return [...majorKeys, ...minorKeys].sort();
}

/**
 * Valida se uma string é uma nota musical válida
 */
export function isValidNote(note: string): boolean {
  const internal = toInternalFormat(note);
  return (
    NOTES_SHARP.includes(internal) ||
    NOTES_FLAT.includes(internal) ||
    Object.prototype.hasOwnProperty.call(ENHARMONIC_EQUIVALENTS, internal)
  );
}

/**
 * Valida se uma string é um acorde válido
 */
export function isValidChord(chord: string): boolean {
  const { root } = parseChord(chord);
  return isValidNote(root);
}
