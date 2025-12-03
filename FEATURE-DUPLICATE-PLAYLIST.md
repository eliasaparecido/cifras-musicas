# Feature: Duplicar Playlist

## Descrição
Implementação da funcionalidade de duplicação de playlists, permitindo ao usuário criar uma cópia completa de uma playlist existente com um novo nome.

## Implementação

### Backend

#### Endpoint
```
POST /api/playlists/:id/duplicate
```

**Request Body:**
```json
{
  "name": "Nome da Nova Playlist"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Nome da Nova Playlist",
  "description": "Descrição copiada da original",
  "songs": [...],
  "createdAt": "...",
  "updatedAt": "..."
}
```

#### Lógica
1. Busca a playlist original com todas as músicas
2. Cria uma nova playlist com o nome fornecido
3. Copia a descrição da playlist original
4. Duplica todas as músicas com suas configurações (tom, ordem)
5. Retorna a nova playlist criada

#### Validação
- Nome é obrigatório (min 1 caractere)
- Playlist original deve existir
- Valida UUID do ID da playlist

### Frontend

#### Service Method
```typescript
async duplicate(id: string, name: string): Promise<Playlist>
```

#### UI Components

##### DuplicatePlaylistModal
Componente modal reutilizável que:
- Exibe campo de texto para o novo nome
- Pré-preenche com "{nome original} (cópia)"
- Valida entrada antes de enviar
- Possui botões de Cancelar e Confirmar

##### PlaylistsPage - Botão Duplicar
- Ícone: Copy (lucide-react)
- Cor: Purple (purple-100/purple-700)
- Posicionado entre "Visualizar" e "PDF"
- Sempre habilitado (não depende de ter músicas)

#### Fluxo de Uso
1. Usuário clica no botão "Duplicar" na lista de playlists
2. Modal é aberto com nome sugerido
3. Usuário pode editar o nome
4. Ao confirmar, playlist é duplicada via API
5. Lista é recarregada automaticamente
6. Modal é fechado

## Boas Práticas Aplicadas

### Backend
- ✅ Validação de entrada com Zod
- ✅ Tratamento de erros apropriado
- ✅ Transação do Prisma (create com nested relations)
- ✅ Status codes HTTP corretos (201 para criação)
- ✅ Resposta inclui todas as relações necessárias
- ✅ Mantém integridade dos dados (ordem, tom, etc)

### Frontend
- ✅ Separação de responsabilidades (Service/Component/Page)
- ✅ Componente modal reutilizável
- ✅ Estado gerenciado adequadamente
- ✅ Feedback visual ao usuário
- ✅ Tratamento de erros com alertas
- ✅ TypeScript para type safety
- ✅ UI consistente com o restante da aplicação

## Arquivos Modificados

### Backend
- `backend/src/routes/playlistRoutes.ts`
  - Adicionado schema `duplicatePlaylistSchema`
  - Adicionado endpoint `POST /:id/duplicate`

### Frontend
- `frontend/src/services/playlistService.ts`
  - Adicionado método `duplicate()`
- `frontend/src/components/DuplicatePlaylistModal.tsx` (novo)
  - Componente modal para duplicação
- `frontend/src/pages/PlaylistsPage.tsx`
  - Importado componente `DuplicatePlaylistModal`
  - Importado ícone `Copy`
  - Adicionado estado `duplicatePlaylist`
  - Adicionado handler `handleDuplicate`
  - Adicionado botão "Duplicar" na UI
  - Adicionado modal de duplicação

## Testes Sugeridos

### Backend
- [ ] Duplicar playlist vazia
- [ ] Duplicar playlist com músicas
- [ ] Duplicar playlist inexistente (404)
- [ ] Duplicar sem fornecer nome (400)
- [ ] Verificar que músicas mantêm tom e ordem corretos

### Frontend
- [ ] Abrir modal de duplicação
- [ ] Cancelar duplicação
- [ ] Duplicar com nome padrão
- [ ] Duplicar com nome customizado
- [ ] Verificar reload da lista após duplicação
- [ ] Testar validação de campo vazio

## Melhorias Futuras
- [ ] Adicionar loading state no botão de duplicar
- [ ] Permitir editar descrição durante duplicação
- [ ] Adicionar toast notification ao invés de alert
- [ ] Implementar undo/redo
- [ ] Adicionar confirmação se playlist tiver muitas músicas
