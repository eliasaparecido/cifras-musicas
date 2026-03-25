# 🎵 Cifras Musicais

Sistema completo e profissional para gerenciamento de cifras musicais com transposição de tom e geração de playlists em PDF. Ideal para músicos, igrejas e grupos musicais.

## ✨ Funcionalidades

- 🎼 **Cadastro de Músicas**: Armazene suas cifras com título, artista, tom e letra
- 🎹 **Transposição Automática**: Mude o tom de qualquer música instantaneamente
- 📋 **Playlists Personalizadas**: Organize músicas por evento, tema ou data
- 📄 **Geração de PDF**: Exporte playlists prontas para impressão
- 🔍 **Busca e Filtros**: Encontre músicas rapidamente por título ou artista
- 💾 **Banco SQLite**: Leve, portátil e sem necessidade de servidor externo
- 🐳 **Docker**: Ambiente consistente e fácil de configurar

## 🎯 Casos de Uso

- **Missas e Cultos**: Prepare playlists para celebrações religiosas
- **Bandas e Grupos Musicais**: Organize repertório e compartilhe com membros
- **Professores de Música**: Mantenha biblioteca de músicas para alunos
- **Músicos Solo**: Gerencie seu repertório pessoal

## 🚀 Tecnologias

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router
- Axios
- Zustand (state management)

### Backend
- Node.js + Express + TypeScript
- SQLite + Prisma ORM
- Better-SQLite3
- PDF generation (jsPDF)

## 📦 Estrutura do Projeto

```
cifras-musicas/
├── backend/              # API REST com Express
│   ├── src/
│   │   ├── routes/      # Rotas da API (songs, playlists, pdf)
│   │   ├── utils/       # Utilitários (transposição de tom)
│   │   ├── db/          # Configuração Prisma
│   │   └── server.ts    # Entry point
│   ├── prisma/
│   │   └── schema.prisma # Schema do banco de dados
│   ├── Dockerfile
│   └── package.json
├── frontend/            # Interface React
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── services/    # Integração com API
│   │   ├── types/       # TypeScript interfaces
│   │   └── lib/         # Configurações (axios)
│   ├── Dockerfile
│   └── package.json
├── docker compose.yml   # Orquestração dos containers
├── Makefile            # Comandos facilitados
└── README.md
```

## 🏗️ Arquitetura

### Backend
- **Express.js**: Framework web minimalista
- **TypeScript**: Tipagem estática
- **Prisma ORM**: ORM type-safe para SQLite
- **SQLite**: Banco de dados leve e portátil
- **Zod**: Validação de schemas
- **jsPDF**: Geração de PDFs

### Frontend
- **React 18**: Biblioteca UI moderna
- **TypeScript**: Type-safety no frontend
- **Vite**: Build tool rápida
- **React Router**: Navegação SPA
- **Axios**: Cliente HTTP
- **TailwindCSS**: Framework CSS utility-first
- **Lucide React**: Ícones modernos

### Infraestrutura
- **Docker**: Containerização
- **Docker Compose**: Multi-container orchestration
- **Hot Reload**: Desenvolvimento com live reload

## 🛠️ Instalação e Execução com Docker

### Pré-requisitos
- Docker
- Docker Compose
- Make (opcional, mas recomendado)

### 🚀 Início Rápido (com Make)

```bash
# Setup completo - constrói, inicia e configura o banco
make setup

# Acessar a aplicação
# Frontend: http://localhost:5173
# Backend: http://localhost:3002
# API Health Check: http://localhost:3002/health
```

### Comandos Make disponíveis

```bash
make help      # Mostra todos os comandos disponíveis
make build     # Constrói as imagens Docker
make up        # Inicia os containers
make upd       # Inicia os containers em background
make down      # Para os containers
make logs      # Mostra os logs em tempo real
make restart   # Reinicia os containers
make clean     # Remove containers, volumes e imagens
make migrate   # Executa migrations do Prisma
make studio    # Abre o Prisma Studio (interface visual do banco)
```

### 📦 Passos para executar (sem Make)

```bash
# 1. Construir e iniciar os containers
docker compose up --build -d

# 2. Executar as migrations do banco
docker compose exec backend npx prisma migrate dev --name init

# 3. Acessar a aplicação
# Frontend: http://localhost:5173
# Backend: http://localhost:3002
```

### Comandos úteis

```bash
# Parar os containers
docker compose down

# Ver logs
docker compose logs -f

# Acessar o Prisma Studio (interface visual do banco)
docker compose exec backend npx prisma studio
# Acesse em: http://localhost:5555

# Rebuild completo (se houver mudanças nas dependências)
docker compose down
docker compose up --build
```

## 📋 Funcionalidades

- ✅ Cadastro de músicas cifradas
- ✅ Transposição automática de tom
- ✅ Criação de playlists
- ✅ Geração de PDF com músicas selecionadas
- ✅ Busca e filtros
- ✅ Interface responsiva

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev                    # Frontend + Backend
npm run dev:frontend          # Apenas Frontend
npm run dev:backend           # Apenas Backend

# Build
npm run build                 # Build completo
npm run build:frontend        # Build Frontend
npm run build:backend         # Build Backend

# Banco de dados
npm run prisma:studio --workspace=backend   # Interface visual do banco
```

## 🗂️ Estrutura de Dados

### Músicas
- Título e artista
- Tom original
- Letra com cifras (formato: `[C]texto [Am]aqui`)
- Timestamps de criação e atualização

### Playlists
- Nome e descrição
- Músicas com tom personalizado
- Ordenação customizável
- Geração de PDF com todas as músicas

## 🎨 Interface

A interface é moderna, responsiva e intuitiva:
- **Home**: Acesso rápido às funcionalidades principais
- **Músicas**: Lista, busca e gerenciamento de cifras
- **Detalhes da Música**: Visualização com transposição em tempo real
- **Playlists**: Organização e geração de PDFs
- **Design**: TailwindCSS com tema profissional

## 🔐 Boas Práticas Implementadas

- ✅ TypeScript em 100% do código
- ✅ Validação de dados com Zod
- ✅ Arquitetura limpa e escalável
- ✅ API RESTful bem estruturada
- ✅ Containerização com Docker
- ✅ Hot reload no desenvolvimento
- ✅ Migrations automáticas do banco
- ✅ Documentação completa

## 🤝 Contribuindo

Este é um projeto pessoal, mas sugestões são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📖 Documentação Adicional

- **[API.md](./API.md)** - Documentação completa da API REST
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Guia detalhado de desenvolvimento

## 🐛 Problemas Conhecidos

Nenhum no momento! 🎉

## 🚀 Roadmap

Possíveis melhorias futuras:
- [ ] Autenticação de usuários
- [ ] Suporte a múltiplas vozes/instrumentos
- [ ] Compartilhamento de playlists
- [ ] Exportação para outros formatos (DOCX, TXT)
- [ ] Cifras colaborativas
- [ ] Histórico de versões das músicas
- [ ] Tags e categorias
- [ ] Backup automático na nuvem

## 📝 Licença

Projeto pessoal - Uso livre
