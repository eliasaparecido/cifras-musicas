/**
 * Sistema de transposição de acordes musicais
 */

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Transpõe um acorde por um número de semitons
 */
export function transposeChord(chord: string, fromKey: string, toKey: string): string {
  const fromIndex = NOTES.findIndex(n => fromKey.replace(/m$/, '').toUpperCase() === n);
  const toIndex = NOTES.findIndex(n => toKey.replace(/m$/, '').toUpperCase() === n);
  
  if (fromIndex === -1 || toIndex === -1) return chord;
  
  const semitones = (toIndex - fromIndex + 12) % 12;
  if (semitones === 0) return chord;
  
  // Extrair nota base e sufixo
  const match = chord.match(/^([A-G][#b]?)(.*)/i);
  if (!match) return chord;
  
  const root = match[1].toUpperCase();
  const suffix = match[2];
  
  const rootIndex = NOTES.indexOf(root.replace('B', 'A#').replace('DB', 'C#').replace('EB', 'D#').replace('GB', 'F#').replace('AB', 'G#'));
  if (rootIndex === -1) return chord;
  
  const newIndex = (rootIndex + semitones) % 12;
  return NOTES[newIndex] + suffix;
}
