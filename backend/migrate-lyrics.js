/**
 * Script simples para executar a migração
 * Uso: node migrate-lyrics.js
 */

import { migrateAllSongs } from './dist/utils/migrateLyrics.js';

console.log('🚀 Executando migração de letras...\n');

migrateAllSongs()
  .then((result) => {
    console.log('\n✅ Migração concluída!');
    console.log(`   Músicas migradas: ${result.migrated}`);
    console.log(`   Músicas já atualizadas: ${result.skipped}`);
    console.log(`   Total: ${result.total}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro na migração:', error);
    process.exit(1);
  });

