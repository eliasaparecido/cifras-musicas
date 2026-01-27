# 🔄 Script de Migração - Remover Colchetes [C]

Este script migra todas as músicas do formato antigo `[C]letra` para o novo formato de linhas separadas.

## 📋 O que faz

1. ✅ Remove HTML de músicas antigas
2. ✅ Converte `[C]letra [Am]mais` para formato de linhas separadas:
   ```
   C         Am
   letra     mais
   ```
3. ✅ Atualiza apenas músicas que precisam de migração
4. ✅ Mostra preview antes de atualizar

## 🚀 Como executar

### Opção 1: Dentro do container Docker

```bash
# Entrar no container backend
docker compose exec backend sh

# Executar migração
npm run migrate:brackets

# Sair do container
exit
```

### Opção 2: Localmente (se tiver Node.js instalado)

```bash
cd backend

# Executar migração
npx tsx migrate-remove-brackets.ts
```

## ⚠️ Importante

- **Faça backup do banco antes!**
- O script é idempotente (pode executar múltiplas vezes sem problemas)
- Músicas já no formato correto não serão alteradas

## 📊 Exemplo de saída

```
🎵 Iniciando migração de músicas...

📊 Total de músicas: 50

✏️  Atualizando: Parabéns pra você (Tradicional)
   Original (primeiros 100 chars): [C]Parabéns pra [G]você...
   Processado (primeiros 100 chars): C         G
Parabéns pra você...
   ✅ Atualizado!

📈 Resumo da migração:
   Total: 50
   Atualizadas: 12
   Sem alteração: 38

✅ Migração concluída com sucesso!
```

## 🔍 Verificação

Após executar, acesse o sistema e:
1. Abra uma música que tinha `[C]`
2. Verifique se está no formato de linhas separadas
3. Teste a transposição
4. Gere um PDF e verifique se as cifras estão em negrito
