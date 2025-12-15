/**
 * Script de migração para converter letras antigas (texto puro)
 * para o novo formato HTML preservando espaços múltiplos
 */

import prisma from '../db/prisma.js';

/**
 * Converte texto puro para HTML preservando espaços múltiplos
 */
function convertTextToHtml(text: string): string {
  if (!text) return text;
  
  // Se já for HTML (contém tags), retornar como está
  if (text.includes('<p>') || text.includes('<br')) {
    return text;
  }
  
  // Converter texto puro para HTML
  let html = text;
  
  // Escapar caracteres HTML especiais (exceto espaços)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Converter espaços múltiplos para &nbsp;
  html = html.replace(/ {2,}/g, (match) => {
    return '&nbsp;'.repeat(match.length);
  });
  
  // Converter quebras de linha para <p>
  const lines = html.split('\n');
  html = lines.map(line => `<p>${line || ''}</p>`).join('');
  
  return html;
}

/**
 * Migra todas as músicas do banco de dados
 */
export async function migrateAllSongs() {
  console.log('🔄 Iniciando migração de letras...');
  
  try {
    // Buscar todas as músicas
    const songs = await prisma.song.findMany();
    
    console.log(`📊 Encontradas ${songs.length} músicas para verificar`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const song of songs) {
      // Verificar se precisa migrar (não tem tags HTML)
      if (!song.lyrics.includes('<p>') && !song.lyrics.includes('<br')) {
        const newLyrics = convertTextToHtml(song.lyrics);
        
        await prisma.song.update({
          where: { id: song.id },
          data: { lyrics: newLyrics },
        });
        
        migratedCount++;
        console.log(`✅ Migrada: ${song.title} - ${song.artist}`);
      } else {
        skippedCount++;
        console.log(`⏭️  Já migrada: ${song.title} - ${song.artist}`);
      }
    }
    
    console.log('\n📈 Resumo da migração:');
    console.log(`   ✅ Migradas: ${migratedCount}`);
    console.log(`   ⏭️  Já estavam no novo formato: ${skippedCount}`);
    console.log(`   📊 Total: ${songs.length}`);
    console.log('\n✨ Migração concluída com sucesso!');
    
    return { migrated: migratedCount, skipped: skippedCount, total: songs.length };
  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    throw error;
  }
}

/**
 * Reverte a migração (converte HTML de volta para texto puro)
 * Use apenas se necessário!
 */
export async function revertMigration() {
  console.log('🔄 Revertendo migração...');
  
  try {
    const songs = await prisma.song.findMany();
    
    let revertedCount = 0;
    
    for (const song of songs) {
      if (song.lyrics.includes('<p>') || song.lyrics.includes('<br')) {
        // Remover tags HTML e converter &nbsp; de volta
        let plainText = song.lyrics
          .replace(/<\/p>/gi, '\n')
          .replace(/<p>/gi, '')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .trim();
        
        await prisma.song.update({
          where: { id: song.id },
          data: { lyrics: plainText },
        });
        
        revertedCount++;
        console.log(`↩️  Revertida: ${song.title} - ${song.artist}`);
      }
    }
    
    console.log(`\n✅ Revertidas ${revertedCount} músicas`);
    
    return { reverted: revertedCount };
  } catch (error) {
    console.error('❌ Erro ao reverter:', error);
    throw error;
  }
}

// Se executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateAllSongs()
    .then(() => {
      console.log('\n✅ Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro ao executar script:', error);
      process.exit(1);
    });
}


