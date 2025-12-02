# 🛠️ Guia de Desenvolvimento

## Visão Geral

Este projeto segue as melhores práticas de desenvolvimento profissional, com foco em:
- **Type Safety**: TypeScript em todo o código
- **Clean Architecture**: Separação clara de responsabilidades
- **API RESTful**: Endpoints bem estruturados e documentados
- **Containerização**: Docker para ambiente consistente
- **Hot Reload**: Desenvolvimento ágil com recarga automática

---

## 🏗️ Estrutura do Backend

### Camadas

```
backend/src/
├── routes/          # Definição de rotas e controllers
│   ├── songRoutes.ts
│   ├── playlistRoutes.ts
│   └── pdfRoutes.ts
├── utils/           # Funções utilitárias
│   └── transposeUtils.ts  # Lógica de transposição
├── db/              # Configuração do banco
│   └── prisma.ts
└── server.ts        # Entry point da aplicação
```

### Adicionar Nova Rota

1. Criar arquivo em `src/routes/`:
```typescript
import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  // Lógica aqui
  res.json({ message: 'Hello' });
});

export default router;
```

2. Registrar no `server.ts`:
```typescript
import minhaRota from './routes/minhaRota.js';
app.use('/api/minha-rota', minhaRota);
```

### Validação de Dados

Usamos **Zod** para validação:

```typescript
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  email: z.string().email('Email inválido'),
});

// No endpoint
try {
  const validatedData = schema.parse(req.body);
  // Usar validatedData
} catch (error) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ errors: error.errors });
  }
}
```

---

## 🎨 Estrutura do Frontend

### Organização

```
frontend/src/
├── components/      # Componentes reutilizáveis
│   └── Layout.tsx
├── pages/           # Páginas/Rotas
│   ├── HomePage.tsx
│   ├── SongsPage.tsx
│   ├── SongDetailPage.tsx
│   └── ...
├── services/        # Chamadas à API
│   ├── songService.ts
│   └── playlistService.ts
├── types/           # TypeScript interfaces
│   └── index.ts
└── lib/             # Configurações
    └── api.ts       # Axios setup
```

### Criar Nova Página

1. Criar componente em `pages/`:
```typescript
export default function MinhaPage() {
  return (
    <div>
      <h1>Minha Página</h1>
    </div>
  );
}
```

2. Adicionar rota em `App.tsx`:
```typescript
<Route path="/minha-pagina" element={<MinhaPage />} />
```

### Fazer Chamada à API

```typescript
import api from '../lib/api';

// GET
const data = await api.get('/endpoint');

// POST
const result = await api.post('/endpoint', { data });

// PUT
const updated = await api.put('/endpoint/:id', { data });

// DELETE
await api.delete('/endpoint/:id');
```

---

## 💾 Banco de Dados (Prisma)

### Modificar Schema

1. Editar `backend/prisma/schema.prisma`:
```prisma
model NovoModel {
  id        String   @id @default(uuid())
  campo     String
  createdAt DateTime @default(now())
}
```

2. Criar migration:
```bash
docker-compose exec backend npx prisma migrate dev --name adiciona_novo_model
```

3. Gerar client:
```bash
docker-compose exec backend npx prisma generate
```

### Usar Prisma Client

```typescript
import prisma from '../db/prisma.js';

// Criar
const item = await prisma.model.create({
  data: { campo: 'valor' }
});

// Buscar todos
const items = await prisma.model.findMany();

// Buscar um
const item = await prisma.model.findUnique({
  where: { id: '123' }
});

// Atualizar
const updated = await prisma.model.update({
  where: { id: '123' },
  data: { campo: 'novo valor' }
});

// Deletar
await prisma.model.delete({
  where: { id: '123' }
});
```

---

## 🎵 Sistema de Transposição

### Como Funciona

O algoritmo de transposição está em `backend/src/utils/transposeUtils.ts`:

```typescript
// Transpor um acorde individual
transposeChord('C', 2) // => 'D' (2 semitons acima)
transposeChord('Am', -1) // => 'G#m' (1 semitom abaixo)

// Transpor letra completa
const original = "[C]Letra com [Am]acordes [F]aqui";
transposeLyrics(original, 'C', 'D'); 
// => "[D]Letra com [Bm]acordes [G]aqui"
```

### Adicionar Suporte a Novos Acordes

Editar `transposeUtils.ts` e adicionar padrões no regex:

```typescript
const chordRegex = /\[([A-G][#b]?[^\]]*)\]/g;
```

---

## 📄 Geração de PDF

Usamos **jsPDF** para gerar PDFs:

```typescript
import jsPDF from 'jspdf';

const doc = new jsPDF();

// Adicionar texto
doc.setFontSize(18);
doc.text('Título', 20, 20);

doc.setFontSize(10);
doc.text('Conteúdo', 20, 30);

// Gerar e enviar
const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
res.setHeader('Content-Type', 'application/pdf');
res.send(pdfBuffer);
```

---

## 🧪 Testes (Futuro)

Para adicionar testes:

1. Instalar Jest:
```bash
npm install --save-dev jest @types/jest ts-jest
```

2. Criar arquivo de teste:
```typescript
describe('transposeChord', () => {
  it('should transpose C to D', () => {
    expect(transposeChord('C', 2)).toBe('D');
  });
});
```

---

## 🐛 Debug

### Backend

Ver logs em tempo real:
```bash
docker-compose logs -f backend
```

### Frontend

Ver logs do browser:
- Abra DevTools (F12)
- Console mostra erros e logs

### Banco de Dados

Usar Prisma Studio:
```bash
make studio
# ou
docker-compose exec backend npx prisma studio
```

Acesse: http://localhost:5555

---

## 🚀 Deploy (Produção)

### Opções de Deploy

1. **VPS (Digital Ocean, AWS EC2)**:
   - Instalar Docker e Docker Compose
   - Clonar repositório
   - Configurar variáveis de ambiente
   - `docker-compose up -d`

2. **Heroku**:
   - Heroku não suporta SQLite em produção
   - Migrar para PostgreSQL

3. **Vercel (Frontend) + Railway (Backend)**:
   - Frontend: Deploy automático na Vercel
   - Backend: Deploy no Railway com PostgreSQL

### Variáveis de Ambiente

**Backend (.env)**:
```bash
PORT=3001
DATABASE_URL="file:./production.db"
NODE_ENV=production
```

**Frontend (.env)**:
```bash
VITE_API_URL=https://api.seu-dominio.com/api
```

---

## 📝 Convenções de Código

### Nomenclatura

- **Componentes React**: PascalCase (`SongCard.tsx`)
- **Funções**: camelCase (`loadSongs()`)
- **Constantes**: UPPER_SNAKE_CASE (`API_URL`)
- **Arquivos**: camelCase ou kebab-case

### Git Commits

Usar prefixos:
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes

Exemplo: `feat: adiciona busca por artista`

---

## 🔒 Segurança

### Validação

- Sempre validar inputs com Zod
- Sanitizar dados do usuário
- Usar prepared statements (Prisma faz isso)

### CORS

Configurado em `server.ts`:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
```

---

## 📚 Recursos

- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Docker](https://docs.docker.com/)
