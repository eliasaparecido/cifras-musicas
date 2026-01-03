# 🧪 GUIA DE TESTE - Negrito e Formatação

## 📋 Preparação

1. **Abra o DevTools do navegador** (F12)
2. **Vá para a aba Console**
3. **Abra o terminal** e rode:
   ```bash
   docker compose logs -f backend
   ```

## ✅ Teste 1: Criar Nova Música

### Passos:
1. Acesse http://localhost:5173/songs/new
2. Preencha:
   - **Título**: Teste Negrito
   - **Artista**: Teste
   - **Tom**: C
3. **No editor de letra**:
   - Digite: `E` (depois pressione espaço 10 vezes) `A`
   - Selecione a letra `E` e clique no botão **B** (negrito)
   - Digite enter e escreva: `Texto com negrito`
   - Selecione "negrito" e clique no botão **B**
4. Clique em **Salvar**

### O que verificar:

#### No Console do Navegador:
```
=== RichTextEditor onUpdate ===
HTML original: <p><strong>E</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A</p>
HTML após conversão: <p><strong>E</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A</p>

=== CreateSongPage handleSubmit ===
Lyrics: <p><strong>E</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A</p><p>Texto com <strong>negrito</strong></p>
```

✅ **Esperado**: Deve ter tags `<strong>` e `&nbsp;`

#### Nos Logs do Backend:
```
=== POST /api/songs ===
Lyrics original: <p><strong>E</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A</p>...
Lyrics após normalização: <strong>E</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A
...
```

✅ **Esperado**: HTML preservado (tags `<strong>` mantidas)

---

## ✅ Teste 2: Visualizar Música

### Passos:
1. Clique na música que você acabou de criar
2. **Verifique**:
   - O **E** deve estar em **negrito**
   - Deve ter ~10 espaços entre E e A
   - A palavra "negrito" deve estar em **negrito**

#### Nos Logs do Backend:
```
=== GET /api/songs/[id] ===
Query params: { format: undefined }
Lyrics do banco: <strong>E</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A...
Lyrics após normalização: <strong>E</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A...
```

✅ **Esperado**: HTML preservado na visualização

---

## ✅ Teste 3: Editar Música

### Passos:
1. Clique em **Editar**
2. **Verifique no Console**:

```
=== GET /api/songs/[id] ===
Query params: { format: 'separated' }
Lyrics após conversão para separated: <strong>E</strong>&nbsp;&nbsp;&nbsp;&nbsp;...
```

3. **No editor**:
   - O **E** deve estar em **negrito**
   - Os espaços devem estar preservados
   - A palavra "negrito" deve estar em **negrito**

✅ **Esperado**: Formatação preservada no editor

---

## ✅ Teste 4: Gerar PDF

### Passos:
1. Crie uma playlist
2. Adicione a música de teste
3. Clique em **Baixar PDF**
4. Abra o PDF
5. **Verifique**:
   - O **E** deve estar em **negrito** no PDF
   - Os espaços devem estar alinhados

---

## 🐛 O QUE PROCURAR SE DER ERRO

### Se negrito NÃO aparecer no editor:
- Verifique se `HTML original` no console tem `<strong>`
- Se não tiver, o TipTap não está aplicando negrito

### Se negrito NÃO for salvo:
- Verifique `Lyrics após normalização` no backend
- Se tiver `stripHtmlTags` sendo chamado, há um problema

### Se negrito NÃO aparecer na visualização:
- Verifique o CSS no DevTools
- Selecione o elemento e veja se `font-weight: 700` está aplicado
- Veja se tem `!important` sobrescrevendo

### Se negrito aparecer mas espaços sumirem:
- Verifique se há `&nbsp;` no HTML
- Veja se `white-space: pre-wrap` está aplicado no CSS

---

## 📸 Envie os Logs

Se ainda não funcionar, copie e envie:
1. Todo o console do navegador (desde "=== RichTextEditor onUpdate ===")
2. Os logs do backend (desde "=== POST /api/songs ===")
3. Screenshot do elemento no DevTools mostrando o CSS aplicado
