# ⚡ Guia Rápido de Início

## 🚀 Setup em 3 Passos

### 1. Executar Setup Automático
```bash
./setup.sh
```

**OU** usando Make:
```bash
make setup
```

**OU** manualmente:
```bash
docker-compose up --build -d
docker-compose exec backend npx prisma migrate dev --name init
```

### 2. Acessar a Aplicação
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3002
- **Health Check**: http://localhost:3002/health

### 3. Popular com Dados de Teste (Opcional)
```bash
make seed
```

---

## 📝 Primeiro Uso

### Cadastrar sua primeira música

1. Acesse http://localhost:5173
2. Clique em **"Nova Música"**
3. Preencha:
   - **Título**: "Amazing Grace"
   - **Artista**: "John Newton"  
   - **Tom Original**: "G"
   - **Letra com Cifras**:
   ```
   [G]Amazing [C]grace, how [G]sweet the [D]sound
   [G]That saved a [C]wretch like [G]me
   ```
4. Clique em **"Salvar"**

### Criar sua primeira playlist

1. Vá em **"Playlists"** > **"Nova Playlist"**
2. Nome: "Missa de Domingo"
3. Descrição: "Músicas para a missa"
4. Adicione músicas da sua lista
5. Escolha o tom desejado para cada música
6. Clique em **"Gerar PDF"**

---

## 🎵 Testando Transposição

1. Abra uma música
2. Use o seletor de tom
3. Veja os acordes mudarem automaticamente!

**Exemplo**: Música em G transposta para C:
- `[G]` vira `[C]`
- `[Am]` vira `[Dm]`
- `[D]` vira `[G]`

---

## 🔧 Comandos Essenciais

```bash
# Ver logs
make logs

# Parar aplicação
make down

# Reiniciar
make restart

# Limpar tudo
make clean

# Abrir admin do banco
make studio
```

---

## 📚 Próximos Passos

1. ✅ Cadastre suas músicas favoritas
2. ✅ Experimente transpor para diferentes tons
3. ✅ Crie playlists temáticas
4. ✅ Gere PDFs para suas apresentações
5. ✅ Leia [API.md](./API.md) para usar via API
6. ✅ Leia [DEVELOPMENT.md](./DEVELOPMENT.md) para desenvolver

---

## ❓ Problemas?

### Docker não está rodando
```bash
sudo systemctl start docker
```

### Porta já em uso
Mude as portas no `docker-compose.yml`:
```yaml
ports:
  - "3003:3002"  # Backend
  - "5174:5173"  # Frontend
```

### Banco não criado
```bash
docker-compose exec backend npx prisma migrate dev --name init
```

### Frontend não carrega
Verifique se o backend está rodando:
```bash
curl http://localhost:3002/health
```

---

## 🎉 Pronto!

Você está pronto para usar o sistema! 

Aproveite para organizar suas cifras e criar suas playlists personalizadas! 🎸
