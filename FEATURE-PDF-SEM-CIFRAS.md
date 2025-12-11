# Feature: Visualização de PDF com/sem Cifras

## Descrição

Implementada opção para gerar PDFs de playlists em dois formatos diferentes:

### 1. **Com Cifras** (padrão)

- Mantém os acordes/cifras visíveis
- Uma música por página
- Layout otimizado para performance ao vivo

### 2. **Só Letras** (novo)

- Remove todos os acordes/cifras
- Múltiplas músicas por página
- Layout otimizado para leitura/canto

## Alterações Realizadas

### Backend

#### 1. **lyricsParser.ts** - Nova função para remover cifras

```typescript
export function removeChords(lyrics: string): string;
```

- Remove todas as cifras no formato `[acorde]`
- Mantém apenas o texto da letra

#### 2. **pdfRoutes.ts** - Atualização da rota de geração de PDF

- Novo parâmetro `showChords` (boolean, padrão: true)
- Duas lógicas de renderização:
  - **Com cifras**: uma música por página, formato atual
  - **Sem cifras**: múltiplas músicas por página quando possível

##### Lógica de Paginação Sem Cifras:

- Calcula altura necessária para cada música
- Tenta colocar múltiplas músicas na mesma página
- Quebra página apenas quando necessário
- Espaçamento menor entre elementos
- Fontes ligeiramente menores para otimizar espaço

### Frontend

#### 1. **playlistService.ts**

```typescript
async generatePDF(playlistId: string, showChords: boolean = true): Promise<Blob>
```

- Atualizado para enviar parâmetro `showChords` ao backend

#### 2. **PlaylistPreviewModal.tsx**

- Adicionado toggle "Mostrar cifras" no header
- PDF é regenerado automaticamente ao alternar o toggle
- Estado inicial: cifras visíveis (true)

#### 3. **PlaylistDetailPage.tsx**

- Botão "Baixar PDF" agora abre um modal de opções
- Modal apresenta duas opções claramente diferenciadas:
  - 🎸 **Com Cifras**: Uma música por página
  - 📝 **Só Letras**: Múltiplas músicas por página
- Nome do arquivo baixado inclui sufixo "-sem-cifras" quando aplicável

#### 4. **PlaylistsPage.tsx**

- Mesmo modal de opções adicionado ao botão PDF de cada playlist
- Comportamento consistente com PlaylistDetailPage

## Experiência do Usuário

### Visualização (PlaylistPreviewModal)

1. Usuário clica em "👁️ Visualizar"
2. Modal abre mostrando o PDF com cifras por padrão
3. Usuário pode alternar entre modos usando o checkbox "Mostrar cifras"
4. PDF é regenerado automaticamente ao alternar
5. Opção de baixar mantém o formato selecionado

### Download Direto (PlaylistDetailPage e PlaylistsPage)

1. Usuário clica em "📄 Baixar PDF"
2. Modal apresenta duas opções claras
3. Usuário escolhe o formato desejado
4. PDF é gerado e baixado automaticamente
5. Nome do arquivo reflete o formato escolhido

## Casos de Uso

### Com Cifras

- Performance ao vivo com instrumento
- Estudo de harmonia
- Prática individual

### Só Letras

- Coral ou grupo vocal
- Cancioneiros
- Economia de papel (mais músicas por página)
- Foco apenas na letra/melodia

## Detalhes Técnicos

### Cálculo de Altura (Modo Sem Cifras)

```typescript
const headerHeight = 7 + 6 + 6; // título + artista + tom
const lyricsHeight = lines.length * lineHeight;
const totalHeight = headerHeight + lyricsHeight + 8; // +8 para espaçamento
```

### Verificação de Espaço

```typescript
if (!isFirstSong && yPosition + totalHeight > pageHeight - 20) {
  // Não cabe, adicionar nova página
  doc.addPage();
  yPosition = 20;
}
```

### Otimizações no Modo Sem Cifras

- `lineHeight`: 4.5 (vs 5 com cifras)
- Fontes ligeiramente menores
- Espaçamento de 12pt entre músicas
- Remove linhas vazias para economizar espaço

## Testes Sugeridos

1. **Playlist pequena (2-3 músicas)**

   - Verificar que sem cifras todas cabem em uma página
   - Com cifras cada uma deve estar em página separada

2. **Playlist grande (10+ músicas)**

   - Verificar quebras de página apropriadas
   - Confirmar que não há músicas cortadas no meio

3. **Músicas longas**

   - Verificar comportamento quando uma música não cabe em uma página
   - Confirmar que quebra corretamente

4. **Toggle no Modal de Visualização**

   - Verificar que alterna suavemente
   - Confirmar que estado é mantido ao baixar

5. **Dispositivos Móveis**
   - Modal de opções deve ser responsivo
   - Toggle deve ser fácil de interagir no touch

## Melhorias Futuras (Sugestões)

1. Memorizar última escolha do usuário (localStorage)
2. Opção de escolher tamanho de fonte
3. Preview lado a lado dos dois formatos
4. Estatísticas de quantas páginas serão geradas
5. Modo "compacto" com fonte ainda menor
