import { transposeLyrics } from './src/utils/transposeUtils.js';
import { normalizeLyrics, convertInlineToChordOverLyrics } from './src/utils/lyricsParser.js';

// Música do teste
const lyrics = `     D         A7             Bm
A palavra do Senhor quando chegou
A/C#     D        G       D    A7
Desinstalou       meu coração
     D          A7          Bm
Ao chegar, desafiou-me a exigir
A/C#    G     A7             D
Uma resposta   de  sim  ou  não

   G           Em     G           Em
É fácil dizer sim, é fácil dizer não
     G             Em    G              D Em
Mas dói depois do sim, dói depois do não
F#m      Bm          E4 E
A.... Palavra do Senhor
                   Em           
Depois que ela passou, nada mais

A                     D
Será do jeito que já foi
`;

console.log('========================================');
console.log('TESTE DE TRANSPOSIÇÃO');
console.log('========================================\n');

console.log('1. LETRA ORIGINAL (formato chord-over-lyrics):');
console.log('---');
console.log(lyrics);
console.log('---\n');

console.log('2. NORMALIZANDO para formato inline [acorde]texto:');
const normalized = normalizeLyrics(lyrics);
console.log('---');
console.log(normalized);
console.log('---\n');

console.log('3. TRANSPONDO de D para E:');
const transposed = transposeLyrics(normalized, 'D', 'E');
console.log('---');
console.log(transposed);
console.log('---\n');

console.log('4. CONVERTENDO de volta para chord-over-lyrics:');
const converted = convertInlineToChordOverLyrics(transposed);
console.log('---');
console.log(converted);
console.log('---\n');

console.log('========================================');
console.log('TESTE COMPLETO');
console.log('========================================');

