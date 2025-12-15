import { transposeLyrics } from './src/utils/transposeUtils.js';
import { normalizeLyrics, convertInlineToChordOverLyrics } from './src/utils/lyricsParser.js';

// Simula exatamente o que vem do banco de dados
const songFromDB = {
  id: "97bc7a20-7a5b-486c-94b3-4b789c759c4f",
  title: "A palavra do Senhor quando chegou",
  artist: "Padre Zezinho",
  originalKey: "D",
  lyrics: "     D         A7             Bm\nA palavra do Senhor quando chegou\nA/C#     D        G       D    A7\nDesinstalou       meu coração\n     D          A7          Bm\nAo chegar, desafiou-me a exigir\nA/C#    G     A7             D\nUma resposta   de  sim  ou  não\n\n   G           Em     G           Em\nÉ fácil dizer sim, é fácil dizer não\n     G             Em    G              D Em\nMas dói depois do sim, dói depois do não\nF#m      Bm          E4 E\nA.... Palavra do Senhor\n                   Em           \nDepois que ela passou, nada mais\n\nA                     D\nSerá do jeito que já foi\n"
};

// Parâmetros da requisição
const requestedKey = "E";
const format = "separated";

console.log('========================================');
console.log('SIMULAÇÃO DO FLUXO COMPLETO DO BACKEND');
console.log('========================================\n');

console.log('1. SONG FROM DATABASE:');
console.log('   originalKey:', songFromDB.originalKey);
console.log('   lyrics (first 150 chars):', songFromDB.lyrics.substring(0, 150));
console.log();

// Simula o código do backend
let lyrics = songFromDB.lyrics;
let currentKey = songFromDB.originalKey;

console.log('2. NORMALIZE LYRICS:');
lyrics = normalizeLyrics(lyrics);
console.log('   Result (first 150 chars):', lyrics.substring(0, 150));
console.log();

console.log('3. TRANSPOSE?');
console.log('   requestedKey:', requestedKey);
console.log('   originalKey:', songFromDB.originalKey);
console.log('   Should transpose?', requestedKey !== songFromDB.originalKey);

if (requestedKey && requestedKey !== songFromDB.originalKey) {
  console.log('   ✓ YES, transposing from', songFromDB.originalKey, 'to', requestedKey);
  lyrics = transposeLyrics(lyrics, songFromDB.originalKey, requestedKey);
  currentKey = requestedKey;
  console.log('   Result (first 150 chars):', lyrics.substring(0, 150));
} else {
  console.log('   ✗ NO transpose needed');
}
console.log();

console.log('4. CONVERT TO SEPARATED FORMAT?');
console.log('   format:', format);
if (format === "separated") {
  console.log('   ✓ YES, converting to chord-over-lyrics');
  lyrics = convertInlineToChordOverLyrics(lyrics);
  console.log('   Result (first 300 chars):', lyrics.substring(0, 300));
}
console.log();

console.log('5. FINAL RESPONSE:');
const response = {
  ...songFromDB,
  lyrics,
  currentKey
};
console.log('   currentKey:', response.currentKey);
console.log('   lyrics (first 300 chars):');
console.log('---');
console.log(response.lyrics.substring(0, 300));
console.log('---');
console.log();

console.log('========================================');
console.log('Verificação: Os acordes mudaram de D/A7/Bm para E/B7/C#m?');
console.log('========================================');

