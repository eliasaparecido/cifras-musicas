# 🧪 Teste Manual do Sistema de Transposição

## Como testar no sistema

### 1. Criar uma música com bemóis

**POST** `/api/songs`

```json
{
  "title": "Teste de Transposição Eb",
  "artist": "Teste",
  "originalKey": "Eb",
  "lyrics": "[Eb]Senhor [Bb]meu Deus, quando eu [Cm]maravilhado\nContemplo a [Ab]tua criação\nO [Eb]céu azul de [Bb]astros pontilhado\nMostram [Cm]teu poder e [Ab]glória, então [Eb]"
}
```

### 2. Buscar a música em outro tom

**GET** `/api/songs/:id?key=F`

Deve retornar:

```json
{
  "id": "...",
  "title": "Teste de Transposição Eb",
  "artist": "Teste",
  "originalKey": "Eb",
  "currentKey": "F",
  "lyrics": "[F]Senhor [C]meu Deus, quando eu [Dm]maravilhado\nContemplo a [Bb]tua criação\nO [F]céu azul de [C]astros pontilhado\nMostram [Dm]teu poder e [Bb]glória, então [F]"
}
```

### 3. Criar playlist e gerar PDF

1. Criar playlist com a música
2. Definir o tom desejado (ex: F)
3. Gerar PDF - deve mostrar os acordes transpostos corretamente

## Casos de Teste

### Teste 1: Eb → F (+2 semitons)

- [Eb] → [F] ✅
- [Bb] → [C] ✅
- [Cm] → [Dm] ✅
- [Ab] → [Bb] ✅

### Teste 2: Bb → C (+2 semitons)

- [Bb] → [C] ✅
- [Eb] → [F] ✅
- [Ab] → [Bb] ✅
- [F] → [G] ✅

### Teste 3: Ab → Bb (+2 semitons)

- [Ab] → [Bb] ✅
- [Db] → [Eb] ✅
- [Eb] → [F] ✅
- [Fm] → [Gm] ✅

### Teste 4: Acordes Complexos

- [Ebm7] → [Fm7] ✅
- [Bb7] → [C7] ✅
- [Abmaj7] → [Bbmaj7] ✅
- [Eb/Bb] → [F/C] ✅

## Verificação de Erros Anteriores

**❌ Erro Anterior**: Acordes com bemóis não eram transpostos

- Entrada: `[Eb]Teste`
- Tom original: `Eb`
- Tom destino: `F`
- Saída anterior (ERRADA): `[Eb]Teste` (sem transposição)
- Saída atual (CORRETA): `[F]Teste` ✅

**✅ Agora funciona!**

## Teste via cURL

```bash
# 1. Criar música
curl -X POST http://localhost:3001/api/songs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quão Grande és Tu",
    "artist": "Hino Avulso 180",
    "originalKey": "Eb",
    "lyrics": "[Eb]Senhor [Bb]meu Deus, quando eu [Cm]maravilhado\nContemplo a [Ab]tua criação"
  }'

# 2. Buscar em tom F (resposta terá acordes transpostos)
curl http://localhost:3001/api/songs/<ID>?key=F

# 3. Buscar em tom G (resposta terá acordes transpostos)
curl http://localhost:3001/api/songs/<ID>?key=G
```

## Validação de Resultados

### Eb → F (+2 semitons)

```
Original:  [Eb]Senhor [Bb]meu Deus, quando eu [Cm]maravilhado
Transposto: [F]Senhor [C]meu Deus, quando eu [Dm]maravilhado
Status: ✅ CORRETO
```

### Eb → G (+4 semitons)

```
Original:  [Eb]Senhor [Bb]meu Deus, quando eu [Cm]maravilhado
Transposto: [G]Senhor [D]meu Deus, quando eu [Em]maravilhado
Status: ✅ CORRETO
```

### Eb → C (-3 ou +9 semitons)

```
Original:  [Eb]Senhor [Bb]meu Deus, quando eu [Cm]maravilhado
Transposto: [C]Senhor [G]meu Deus, quando eu [Am]maravilhado
Status: ✅ CORRETO
```

## 🎯 Resultado Esperado

Todos os acordes com bemóis devem ser reconhecidos e transpostos corretamente para qualquer tom destino, mantendo:

1. ✅ Intervalos musicais
2. ✅ Funções harmônicas
3. ✅ Tipo de acorde (maior, menor, 7ª, etc.)
4. ✅ Baixos invertidos (se existirem)
