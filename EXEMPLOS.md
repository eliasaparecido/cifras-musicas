# 🎵 Músicas de Exemplo para Testes

Use essas músicas para testar o sistema. Você pode copiá-las e criar via interface ou API.

## 1. Amazing Grace

**Artista:** John Newton  
**Tom Original:** G

```
[G]Amazing [C]grace, how [G]sweet the [D]sound
[G]That saved a [C]wretch like [G]me
[G]I once was [C]lost, but [G]now am [D]found
Was [G]blind but [C]now I [G]see

[G]'Twas grace that [C]taught my [G]heart to [D]fear
And [G]grace my [C]fears re[G]lieved
[G]How precious [C]did that [G]grace ap[D]pear
The [G]hour I [C]first be[G]lieved
```

---

## 2. Eu Navegarei

**Artista:** Vineyard  
**Tom Original:** D

```
[D]Eu navegarei no [A]oceano do Espírito
E [Bm]ali adorarei ao [F#m]Deus do meu a[G]mor
[D]Espírito, [A]Espírito que [G]desce sobre [D]mim
E [G]me leva aos [D]céus, [A]me faz ado[D]rar

[D]Eu adorarei ao [A]Deus da minha vida
Que [Bm]me compreendeu sem [F#m]nenhuma expli[G]cação
[D]É tão bom te a[A]dorar, tua [G]glória contem[D]plar
[G]Te olhar, [D]teu amor me [A]faz canti[D]car
```

---

## 3. Quão Grande És Tu

**Artista:** Tradicional  
**Tom Original:** C

```
[C]Senhor meu [Am]Deus, quando eu ma[C]ravilhado
[F]Fico a pen[C]sar nas obras de Tuas [G]mãos
O [C]céu azul, as [Am]nuvens com es[C]plendor
O [F]som do [C]mar, a terra e os [G]campos em [C]flor

Refrão:
[C]Minha alma [Am]canta en[F]tão a [C]Ti, Senhor
[C]Quão grande [G]és Tu! [C]Quão grande [G7]és Tu!
[C]Minha alma [Am]canta en[F]tão a [C]Ti, Senhor
[C]Quão grande [G]és Tu! [C]Quão grande [G]és [C]Tu!
```

---

## 4. Aleluia

**Artista:** Leonard Cohen  
**Tom Original:** C

```
[C]Now I've [Am]heard there was a [C]secret chord
That [Am]David played, and it [F]pleased the Lord
But [G]you don't really [C]care for music, [G]do you?
It [C]goes like this, the [F]fourth, the [G]fifth
The [Am]minor fall, the [F]major lift
The [G]baffled king com[E7]posing Halle[Am]lujah

Refrão:
Halle[F]lujah, Halle[Am]lujah
Halle[F]lujah, Halle[C]lu[G]jah[C]
```

---

## 5. Casa do Pai

**Artista:** Aline Barros  
**Tom Original:** G

```
[G]Eu quero estar na [D]casa do Pai
[Em]Adorá-lo e [C]servi-lo [D]sempre
[G]Pois só ali eu [D]sou feliz
[Em]No lugar que [C]Deus [D]esco[G]lheu

Refrão:
E eu [C]vou [D]adorar, [G]sim [Em]eu vou
[Am]Prostrado aos [D]Teus pés
E eu [C]vou [D]adorar, [G]sei que [Em]Tu és
O [Am]Deus [D]de Is[G]rael
```

---

## 6. Como Zaqueu

**Artista:** Regis Danese  
**Tom Original:** Am

```
[Am]Como Zaqueu, eu quero [F]subir
O mais [G]alto que eu puder, só pra Te [Am]ver
[Am]E chamar Tua aten[F]ção
Para [G]mim, olhar pra [E7]mim

Refrão:
Senhor, [Am]eu preciso falar con[F]tigo
Senhor, [G]venha até minha [Am]casa
[Am]Eu preciso tanto de [F]Ti
Eu [G]quero tanto Te ou[Am]vir
```

---

## 7. Que Alegria

**Artista:** Padre Zezinho  
**Tom Original:** D

```
[D]Que alegria, [A7]que alegria
Quando [D]me disseram: [G]vamos à [D]casa [A7]do Se[D]nhor
[D]Que alegria, [A7]que alegria
Quando [D]me disseram: [G]vamos à [D]casa [A7]do Se[D]nhor

Está [G]chegando o [A7]dia
Es[D]tou indo [Bm]pra lá
Pra [G]casa do meu [D]Pai
[A7]Meu Deus me espe[D]ra
```

---

## Como Usar

### Via Interface (Frontend)

1. Acesse http://localhost:5173
2. Clique em "Músicas" > "Nova Música"
3. Preencha os campos com os dados acima
4. Salve

### Via API (cURL)

```bash
curl -X POST http://localhost:3002/api/songs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Amazing Grace",
    "artist": "John Newton",
    "originalKey": "G",
    "lyrics": "[G]Amazing [C]grace..."
  }'
```

### Via Seed Script

Execute o seed para popular automaticamente:
```bash
make seed
# ou
docker compose exec backend npm run seed
```

---

## Dicas

- Use **colchetes** para marcar acordes: `[C]` `[Am]` `[F]`
- Acordes suportados: maiores (C, D, E...), menores (Cm, Dm...), sétima (C7, Am7...), etc
- A transposição funciona automaticamente com todos os acordes
- Organize por playlists temáticas: "Missa", "Louvor", "Adoração", etc
