/**
 * Script de migração: Remove colchetes [C] das cifras antigas
 * Converte [C]Letra [Am]mais para formato de linhas separadas
 */

import prisma from './src/db/prisma.js';

/**
 * Remove tags HTML
 */
function stripHtml(html: string): string {
  if (!html) return '';
  
  let text = html
    .replace(/<\/p>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');
  
  return text.trim();
}

/**
 * Converte formato [C]letra para linhas separadas
 */
function convertBracketFormatToLines(lyrics: string): string {
  const lines = lyrics.split('\n');
  const result: string[] = [];
  
  for (const line of lines) {
    if (!line.includes('[') || !line.includes(']')) {
      result.push(line);
      continue;
    }
    
    // Extrair acordes e texto
    const chords: Array<{ pos: number; chord: string }> = [];
    let text = '';
    let i = 0;
    let currentPos = 0;
    
    while (i < line.length) {
      if (line[i] === '[') {
        const endIndex = line.indexOf(']', i);
        if (endIndex !== -1) {
          const chord = line.substring(i + 1, endIndex);
          chords.push({ pos: currentPos, chord });
          i = endIndex + 1;
        } else {
          text += line[i];
          currentPos++;
          i++;
        }
      } else {
        text += line[i];
        currentPos++;
        i++;
      }
    }
    
    if (chords.length === 0) {
      result.push(line);
      continue;
    }
    
    // Criar linha de acordes
    let chordLine = '';
    let lastPos = 0;
    
    for (const { pos, chord } of chords) {
      chordLine += ' '.repeat(Math.max(0, pos - lastPos));
      chordLine += chord;
      lastPos = pos + chord.length;
    }
    
    // Adicionar linha de acordes e linha de texto
    result.push(chordLine);
    result.push(text);
  }
  
  return result.join('\n');
}

/**
 * Processa uma música
 */
function processSong(lyrics: string): string {
  // 1. Remove HTML se houver
  let cleaned = stripHtml(lyrics);
  
  // 2. Remove colchetes [C] se houver
  if (cleaned.includes('[') && cleaned.includes(']')) {
    cleaned = convertBracketFormatToLines(cleaned);
  }
  
  return cleaned;
}

async function migrate() {
  console.log('🎵 Iniciando migração de músicas...\n');
  
  try {
    // Buscar todas as músicas
    const songs = await prisma.song.findMany();
    console.log(`📊 Total de músicas: ${songs.length}\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const song of songs) {
      const originalLyrics = song.lyrics;
      const processedLyrics = processSong(originalLyrics);
      
      // Só atualiza se houver mudança
      if (processedLyrics !== originalLyrics) {
        console.log(`✏️  Atualizando: ${song.title} (${song.artist})`);
        console.log(`   Original (primeiros 100 chars): ${originalLyrics.substring(0, 100)}...`);
        console.log(`   Processado (primeiros 100 chars): ${processedLyrics.substring(0, 100)}...`);
        
        await prisma.song.update({
          where: { id: song.id },
          data: { lyrics: processedLyrics },
        });
        
        updated++;
        console.log('   ✅ Atualizado!\n');
      } else {
        skipped++;
      }
    }
    
    console.log('\n📈 Resumo da migração:');
    console.log(`   Total: ${songs.length}`);
    console.log(`   Atualizadas: ${updated}`);
    console.log(`   Sem alteração: ${skipped}`);
    console.log('\n✅ Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
migrate();
