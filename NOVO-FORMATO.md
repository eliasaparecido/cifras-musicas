# 🎵 Teste do Novo Formato de Cifras

## Agora você pode cadastrar músicas de 2 formas diferentes!

### ✅ Formato 1 - Inline (formato antigo ainda funciona)
```
[C]Senhor meu [Am]Deus, quando eu ma[C]ravilhado
[F]Fico a pen[C]sar nas obras de Tuas [G]mãos
```

### ✨ Formato 2 - Linhas Separadas (NOVO - muito mais fácil!)
```
C                        Am                                C
Senhor meu Deus, quando eu maravilhado
F              C                                          G
Fico a pensar nas obras de Tuas mãos
```

---

## 🎸 Exemplo Completo para Testar

Copie e cole este exemplo no formulário de cadastro:

```
C                        Am                                C
Senhor meu Deus, quando eu maravilhado
F              C                                          G
Fico a pensar nas obras de Tuas mãos
  C                 Am                          C
O céu azul, as nuvens com esplendor
  F        C                              G                C
O som do mar, a terra e os campos em flor

Refrão:
C              Am        F           C
Minha alma canta então a Ti, Senhor
C              G                C                G7
Quão grande és Tu! Quão grande és Tu!
C              Am        F           C
Minha alma canta então a Ti, Senhor
C              G                C        G        C
Quão grande és Tu! Quão grande és Tu!
```

---

## Como Funciona

O sistema detecta automaticamente qual formato você está usando:

1. **Se encontrar `[acordes]`** → mantém como está
2. **Se encontrar linhas de acordes acima da letra** → converte automaticamente para o formato inline
3. **Resultado final** → sempre fica no formato `[C]texto` internamente

---

## Vantagens do Novo Formato

- ✅ **Copiar e Colar**: Você pode copiar músicas de sites de cifras direto
- ✅ **Mais Natural**: É o formato mais comum na internet
- ✅ **Conversão Automática**: O sistema converte sozinho
- ✅ **Retrocompatível**: O formato antigo continua funcionando

---

## Para Testar

1. Acesse http://localhost:5173
2. Vá em "Nova Música"
3. Cole o exemplo acima no campo "Letra com Cifras"
4. Salve
5. Veja a mágica acontecer! ✨

O sistema vai:
- Detectar as linhas de acordes
- Identificar a posição de cada acorde
- Inserir os acordes no formato `[acorde]` na letra
- Salvar normalmente

**E a transposição continua funcionando perfeitamente! 🎵**
